import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [topLevelFolders, setTopLevelFolders] = useState([]);
  const [currentFolderContents, setCurrentFolderContents] = useState({ folders: [], files: [] });
  const [newFolderName, setNewFolderName] = useState('');
  const [workerEmail, setWorkerEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [pendingUpload, setPendingUpload] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [showOnlyMyFolders, setShowOnlyMyFolders] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [allFolders, setAllFolders] = useState([]);
  const [allFiles, setAllFiles] = useState([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      loadConfigs();
    }
  }, [isAuthorized, currentFolder]);

  useEffect(() => {
    if (isAuthorized && currentPath.length === 0) {
      console.log('Toggle changed, reloading configs with worker email:', showOnlyMyFolders ? currentUserEmail : null);
      loadConfigs();
    }
  }, [showOnlyMyFolders]);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.configId !== 'admin') {
        // Redirect unauthorized users
        window.location.href = '/';
        return;
      }
      
      setIsAuthorized(true);
      setCurrentUserEmail(data.email);
    } catch (error) {
      console.error('Error checking admin access:', error);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    // If we're at root level, start a new path
    if (currentPath.length === 0) {
      setCurrentFolder(folder);
      setCurrentPath([folder]);
    } else {
      // If we're in a folder, navigate to the clicked folder within current path
      setCurrentFolder(folder);
      setCurrentPath([...currentPath, folder]);
    }
    setCurrentFolderContents({ folders: [], files: [] });
  };

  const handleBackClick = () => {
    if (currentPath.length === 1) {
      // If we're in a top-level folder, go back to root
      setCurrentFolder(null);
      setCurrentPath([]);
      setCurrentFolderContents({ folders: [], files: [] });
    } else {
      // If we're in a nested folder, go up one level
      const newPath = currentPath.slice(0, -1);
      setCurrentPath(newPath);
      setCurrentFolder(newPath[newPath.length - 1]);
      setCurrentFolderContents({ folders: [], files: [] });
    }
  };

  const loadConfigs = async () => {
    try {
      // Clear current folder contents before loading new ones
      setCurrentFolderContents({ folders: [], files: [] });
      
      const prefix = currentPath.length > 0 
        ? `configs/${currentPath.join('/')}/` 
        : 'configs/';

      const requestBody = { 
        prefix,
        worker_email: showOnlyMyFolders ? currentUserEmail : null 
      };
      console.log('Sending request to list-configs with body:', requestBody);

      const response = await fetch('/api/admin/list-configs', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthorized(false);
          window.location.href = '/';
          return;
        }
        throw new Error('Failed to load configs');
      }

      const data = await response.json();
      console.log('Received data from API:', data);
      
      if (currentPath.length > 0) {
        // If we're in a specific folder, update current folder contents
        setCurrentFolderContents({
          folders: data.folders,
          files: data.files
        });
      } else {
        // If we're at root, update top-level folders
        setTopLevelFolders(data.folders);
      }
    } catch (error) {
      console.error('Error loading configs:', error);
      setError('Failed to load configurations');
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName || !workerEmail) return;

    try {
      const response = await fetch('/api/admin/create-folder', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          folder: currentPath.length > 0 
            ? `${currentPath.join('/')}/${newFolderName}`
            : newFolderName,
          worker_email: workerEmail
        }),
      });

      if (!response.ok) throw new Error('Failed to create folder');

      setNewFolderName('');
      setWorkerEmail('');
      setShowNewFolderForm(false);
      loadConfigs();
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Failed to create folder');
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        setPendingUpload({
          type: 'file',
          data: event.target.result,
          name: file.name,
          fileType: file.type.startsWith('image/') ? file.type : 'application/json'
        });
        setShowConfirmation(true);
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Error reading file:', error);
      setError('Failed to read file');
    }
  };

  const handleFolderUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const folderFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = (e) => {
          folderFiles.push({
            data: e.target.result,
            name: file.webkitRelativePath || file.name,
            fileType: file.type.startsWith('image/') ? file.type : 'application/json'
          });

          if (folderFiles.length === files.length) {
            setPendingUpload({
              type: 'folder',
              files: folderFiles
            });
            setShowConfirmation(true);
          }
        };

        if (file.type.startsWith('image/')) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      }
    } catch (error) {
      console.error('Error reading folder:', error);
      setError('Failed to read folder');
    }
  };

  const handleConfirmUpload = async () => {
    if (!pendingUpload) return;

    try {
      if (pendingUpload.type === 'file') {
        const response = await fetch('/api/admin/upload-config', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            folder: currentPath.length > 0 ? currentPath.join('/') : null,
            file: pendingUpload.data,
            fileName: pendingUpload.name,
            fileType: pendingUpload.fileType
          }),
        });

        if (!response.ok) throw new Error('Failed to upload file');
      } else {
        // Handle folder upload
        for (const file of pendingUpload.files) {
          const response = await fetch('/api/admin/upload-config', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              folder: currentPath.length > 0 ? currentPath.join('/') : null,
              file: file.data,
              fileName: file.name,
              fileType: 'folder'
            }),
          });

          if (!response.ok) throw new Error('Failed to upload file');
        }
      }

      setPendingUpload(null);
      setShowConfirmation(false);
      loadConfigs();
    } catch (error) {
      console.error('Error uploading to Cloudflare:', error);
      setError('Failed to upload to Cloudflare');
    }
  };

  const handleCancelUpload = () => {
    setPendingUpload(null);
    setShowConfirmation(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-lg shadow-lg text-center"
        >
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You are not authorized to view this page.</p>
          <p className="text-sm text-gray-500">Redirecting to homepage...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showConfirmation && pendingUpload && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Upload</h3>
              <p className="mb-4">
                {pendingUpload.type === 'file' 
                  ? `Ready to upload "${pendingUpload.name}" to Cloudflare?`
                  : `Ready to upload ${pendingUpload.files.length} files to Cloudflare?`}
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancelUpload}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpload}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Upload to Cloudflare
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add toggle switch before the Create new folder button */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyMyFolders}
                onChange={(e) => setShowOnlyMyFolders(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">Show only my folders</span>
            </label>
          </div>
          <button
            onClick={() => setShowNewFolderForm(!showNewFolderForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {showNewFolderForm ? 'Cancel' : 'New Code'}
          </button>
        </div>

        {showNewFolderForm && (
          <form onSubmit={handleCreateFolder} className="mt-4">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New code name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
              <input
                type="email"
                value={workerEmail}
                onChange={(e) => setWorkerEmail(e.target.value)}
                placeholder="Worker email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Create Folder
              </button>
            </div>
          </form>
        )}

        {/* Main content area */}
        <div className="space-y-8">
          {/* Show either config folders or current folder contents */}
          {currentPath.length === 0 ? (
            // Show all config folders
            <div>
              <h2 className="text-xl font-semibold mb-4">Config Folders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topLevelFolders.map((folder) => (
                  <button
                    key={folder}
                    onClick={() => handleFolderClick(folder)}
                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="font-medium">{folder}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Show current folder contents
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Contents of {currentPath.join('/')}
                </h2>
                <button
                  onClick={handleBackClick}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Back to {currentPath.length === 1 ? 'Folders' : currentPath[currentPath.length - 2]}
                </button>
              </div>

              {/* File upload section */}
              <div className="mb-8 space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Upload Single File</label>
                  <input
                    type="file"
                    accept=".json,image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Upload Folder</label>
                  <input
                    type="file"
                    webkitdirectory="true"
                    directory="true"
                    onChange={handleFolderUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-50 file:text-green-700
                      hover:file:bg-green-100"
                  />
                </div>
              </div>

              {/* Contents grid */}
              {currentFolderContents.files.length === 0 && currentFolderContents.folders.length === 0 ? (
                <p className="text-gray-500">Empty folder</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Show subfolders first */}
                  {currentFolderContents.folders.map((folder) => (
                    <button
                      key={folder}
                      onClick={() => handleFolderClick(folder)}
                      className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="font-medium">{folder}</span>
                      </div>
                    </button>
                  ))}
                  {/* Then show files */}
                  {currentFolderContents.files.map((file) => (
                    <div
                      key={file.name}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {new Date(file.uploaded).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 