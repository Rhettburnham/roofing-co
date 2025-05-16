import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

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

  const loadConfigs = async () => {
    try {
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

      if (!response.ok) throw new Error('Failed to load configs');

      const data = await response.json();
      setFolders(data.folders);
      setFiles(data.files);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const fileContent = JSON.parse(event.target.result);
          const response = await fetch('/api/admin/upload-config', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              folder: currentFolder,
              file: fileContent,
            }),
          });

          if (!response.ok) throw new Error('Failed to upload file');

          loadConfigs();
        } catch (error) {
          console.error('Error uploading file:', error);
          setError('Failed to upload file');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setError('Failed to read file');
    }
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
          <div className="mb-8">
            <label className="block text-gray-700 mb-2">Upload combined_data.json</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
        )}

        {/* Folders list */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Folders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <button
                key={folder}
                onClick={() => setCurrentFolder(folder)}
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

        {/* Files list */}
        {currentFolder && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Files in {currentFolder}</h2>
            {files.length === 0 ? (
              <p className="text-red-500">Empty</p>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="p-4 border border-gray-200 rounded-lg flex justify-between items-center"
                  >
                    <span>{file.name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(file.uploaded).toLocaleDateString()}
                    </span>
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