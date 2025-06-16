import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import WorkerCommands from '../components/WorkerCommands';

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

  const saveLogsToFile = (logs) => {
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (isAuthorized && currentPath.length === 0) {
      const logs = [];
      logs.push('=== Toggle State Change ===');
      logs.push(`Time: ${new Date().toISOString()}`);
      logs.push(`Show only my folders: ${showOnlyMyFolders}`);
      logs.push(`Current user email: ${currentUserEmail}`);
      
      if (showOnlyMyFolders && currentUserEmail) {
        const emailPlaceholder = `.${currentUserEmail}`;
        logs.push(`\nLooking for file: ${emailPlaceholder}`);
        logs.push('\nCurrent folder contents:');
        logs.push(JSON.stringify(currentFolderContents, null, 2));
        logs.push('\nTop level folders:');
        logs.push(JSON.stringify(topLevelFolders, null, 2));
        
        const filteredFolders = topLevelFolders.filter(folder => {
          const hasFile = currentFolderContents.files.some(file => {
            const matches = file.name === emailPlaceholder && file.folder === folder;
            logs.push(`\nChecking file: ${file.name} in folder: ${file.folder} against: ${folder}`);
            logs.push(`Matches: ${matches}`);
            return matches;
          });
          logs.push(`\nFolder ${folder} has file: ${hasFile}`);
          return hasFile;
        });
        logs.push('\nFiltered folders:');
        logs.push(JSON.stringify(filteredFolders, null, 2));
        setTopLevelFolders(filteredFolders);
      } else {
        logs.push('\nReloading all configs');
        loadConfigs();
      }
      
      saveLogsToFile(logs.join('\n'));
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

      const response = await fetch('/api/admin/list-configs', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefix }),
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
        // If we're at root, update top-level folders and files
        setTopLevelFolders(data.folders);
        setCurrentFolderContents({
          folders: data.folders,
          files: data.files
        });
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
    <div className="min-h-screen bg-gray-50 p-4">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : !isAuthorized ? (
        <div className="text-center">
          <p>Unauthorized access</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage configurations and files</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {currentPath.length === 0 ? (
            // Root level view
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
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
                  onClick={() => setShowNewFolderForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Create new folder
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topLevelFolders.map((folder) => (
                  <motion.div
                    key={folder}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer"
                    onClick={() => handleFolderClick(folder)}
                  >
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="font-medium">{folder}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            // Inside a folder
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackClick}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <h2 className="text-xl font-semibold">
                  {currentPath.join(' / ')}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-medium mb-4">Files and Folders</h3>
                    {currentFolderContents.folders.length === 0 && currentFolderContents.files.length === 0 ? (
                      <p className="text-gray-500">This folder is empty</p>
                    ) : (
                      <div className="space-y-4">
                        {currentFolderContents.folders.map((folder) => (
                          <motion.div
                            key={folder}
                            whileHover={{ scale: 1.02 }}
                            className="p-3 bg-gray-50 rounded-md cursor-pointer"
                            onClick={() => handleFolderClick(folder)}
                          >
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              <span>{folder}</span>
                            </div>
                          </motion.div>
                        ))}
                        {currentFolderContents.files.map((file) => (
                          <div
                            key={file.name}
                            className="p-3 bg-gray-50 rounded-md"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span>{file.name}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatFileSize(file.size)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-medium mb-4">Upload Files</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Single File
                        </label>
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload(e.target.files[0])}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Folder
                        </label>
                        <input
                          type="file"
                          webkitdirectory="true"
                          directory="true"
                          onChange={handleFolderUpload}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  <WorkerCommands currentFolder={currentFolder} />
                </div>
              </div>
            </div>
          )}

          {showNewFolderForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Create New Folder</h2>
                <form onSubmit={handleCreateFolder} className="space-y-4">
                  <div>
                    <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-1">
                      Folder Name
                    </label>
                    <input
                      type="text"
                      id="folderName"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="workerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Worker Email
                    </label>
                    <input
                      type="email"
                      id="workerEmail"
                      value={workerEmail}
                      onChange={(e) => setWorkerEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowNewFolderForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Confirm Upload</h2>
                <p className="text-gray-600 mb-4">{uploadMessage}</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancelUpload}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmUpload}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 