import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [topLevelFolders, setTopLevelFolders] = useState([]);
  const [currentFolderContents, setCurrentFolderContents] = useState({ folders: [], files: [] });
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [pendingUpload, setPendingUpload] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      loadConfigs();
    }
  }, [isAuthorized, currentFolder]);

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
    } catch (error) {
      console.error('Error checking admin access:', error);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
    setCurrentFolderContents({ folders: [], files: [] });
  };

  const loadConfigs = async () => {
    try {
      // Clear current folder contents before loading new ones
      setCurrentFolderContents({ folders: [], files: [] });
      
      const response = await fetch('/api/admin/list-configs', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prefix: currentFolder ? `configs/${currentFolder}/` : 'configs/',
        }),
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
      
      if (currentFolder) {
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
    if (!newFolderName) return;

    try {
      const response = await fetch('/api/admin/create-folder', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folder: newFolderName }),
      });

      if (!response.ok) throw new Error('Failed to create folder');

      setNewFolderName('');
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
            folder: currentFolder,
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
              folder: currentFolder,
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

        {/* Create new folder form */}
        <form onSubmit={handleCreateFolder} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New code name"
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

        {/* File upload */}
        {currentFolder && (
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
        )}

        {/* Folders list */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Config Folders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topLevelFolders.map((folder) => (
              <button
                key={folder}
                onClick={() => handleFolderClick(folder)}
                className={`p-4 rounded-lg border ${
                  currentFolder === folder
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {folder}
              </button>
            ))}
          </div>
        </div>

        {/* Files and subfolders list */}
        {currentFolder && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Contents of {currentFolder}</h2>
            {currentFolderContents.files.length === 0 && currentFolderContents.folders.length === 0 ? (
              <p className="text-gray-500">Empty folder</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Show subfolders first */}
                {currentFolderContents.folders.map((folder) => {
                  // Find the most recent file in this folder
                  const folderFiles = currentFolderContents.files.filter(file => 
                    file.name.startsWith(folder + '/')
                  );
                  const mostRecentDate = folderFiles.length > 0 
                    ? new Date(Math.max(...folderFiles.map(f => new Date(f.uploaded))))
                    : null;

                  return (
                    <div
                      key={`${currentFolder}-${folder}`}
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="font-medium">{folder}</span>
                      </div>
                      {mostRecentDate && (
                        <div className="mt-2 text-sm text-gray-500">
                          Last modified: {mostRecentDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Then show files */}
                {currentFolderContents.files.map((file) => (
                  <div
                    key={`${currentFolder}-${file.name}`}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
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

        {/* Back button */}
        {currentFolder && (
          <button
            onClick={() => setCurrentFolder(null)}
            className="mt-8 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Back to Folders
          </button>
        )}
      </motion.div>
    </div>
  );
} 