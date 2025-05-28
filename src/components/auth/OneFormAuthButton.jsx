import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminButton from './AdminButton';
import WorkerButton from './WorkerButton';

export default function OneFormAuthButton({ formData, themeColors, servicesData, aboutPageData, showcaseData }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignOut, setShowSignOut] = useState(false);
  const [saveClicked, setSaveClicked] = useState(false);
  const [debug, setDebug] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log("OneFormAuthButton: Starting auth status check...");
      setDebug('Checking auth status...');
      
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log("OneFormAuthButton: Auth status data:", data);
      
      if (data.isAuthenticated) {
        console.log("OneFormAuthButton: User is authenticated");
        setIsLoggedIn(true);
        setDebug('Successfully authenticated');
      } else {
        console.log("OneFormAuthButton: User is not authenticated");
        setIsLoggedIn(false);
        setDebug('Not authenticated');
      }
    } catch (error) {
      console.error("OneFormAuthButton: Auth status check failed:", error);
      setDebug(`Auth status error: ${error.message}`);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    if (isLoggedIn) {
      try {
        console.log("OneFormAuthButton: Starting logout process...");
        setDebug('Logging out...');
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
        
        if (response.ok) {
          console.log("OneFormAuthButton: Logout successful");
          setIsLoggedIn(false);
          setShowSignOut(false);
          setDebug('Logged out successfully');
        } else {
          console.error("OneFormAuthButton: Logout failed with status:", response.status);
          setDebug(`Logout failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error("OneFormAuthButton: Logout error:", error);
        setDebug(`Logout error: ${error.message}`);
      }
    } else {
      console.log("OneFormAuthButton: Redirecting to login page...");
      setDebug('Redirecting to login...');
      window.location.href = '/login';
    }
  };

  const handleSaveClick = async () => {
    try {
      setSaveClicked(true);
      setDebug('Saving changes...');

      if (!formData) {
        setDebug('No form data found');
        return;
      }

      console.log("Saving data:", formData);

      // Get the current config ID from auth status
      const authResponse = await fetch('/api/auth/status', {
        credentials: 'include'
      });
      const authData = await authResponse.json();
      
      if (!authData.isAuthenticated || !authData.configId) {
        setDebug('User not authenticated or no config ID found');
        return;
      }

      // Collect all assets from the form data
      const assets = {};
      const collectAssets = (data) => {
        if (!data) return;
        
        if (typeof data === 'object') {
          Object.entries(data).forEach(([key, value]) => {
            if (value instanceof File) {
              // Handle File objects
              const reader = new FileReader();
              reader.onload = (e) => {
                assets[`assets/${value.name}`] = e.target.result;
              };
              reader.readAsArrayBuffer(value);
            } else if (key === 'url' && typeof value === 'string' && 
                      (value.startsWith('/assets/') || value.startsWith('assets/'))) {
              // Handle asset URLs
              const relativePath = value.startsWith('/') ? value.substring(1) : value;
              assets[relativePath] = value;
            } else if (typeof value === 'object') {
              collectAssets(value);
            }
          });
        } else if (Array.isArray(data)) {
          data.forEach(item => collectAssets(item));
        }
      };

      // Collect assets from all data sources
      collectAssets(formData);
      if (servicesData) collectAssets(servicesData);
      if (aboutPageData) collectAssets(aboutPageData);
      if (showcaseData) collectAssets(showcaseData);

      // Fetch all assets and convert to ArrayBuffer
      const assetPromises = Object.entries(assets).map(async ([path, url]) => {
        if (url instanceof ArrayBuffer) {
          return [path, url];
        }
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch ${url}`);
          const blob = await response.blob();
          const buffer = await blob.arrayBuffer();
          return [path, buffer];
        } catch (error) {
          console.error(`Error fetching asset ${url}:`, error);
          return null;
        }
      });

      const assetResults = await Promise.all(assetPromises);
      const processedAssets = Object.fromEntries(
        assetResults.filter(result => result !== null)
      );

      // Prepare all data to save
      const dataToSave = {
        combined_data: formData,
        colors: themeColors,
        services: servicesData,
        about_page: aboutPageData,
        all_blocks_showcase: showcaseData,
        assets: processedAssets
      };

      // Save all configs to R2
      const saveResponse = await fetch('/api/config/save', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave)
      });

      if (saveResponse.ok) {
        setDebug('Changes saved successfully');
      } else {
        const error = await saveResponse.text();
        setDebug(`Failed to save changes: ${error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      setDebug(`Save error: ${error.message}`);
    } finally {
      setTimeout(() => setSaveClicked(false), 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed top-4 left-4 z-[9999]">
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded text-sm">
          Loading auth status...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-4 left-4 z-[9999] flex flex-col items-center gap-2"
    >
      {/* Debug information */}
      {debug && (
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded mb-4 text-sm max-w-md">
          <pre>{debug}</pre>
        </div>
      )}

      {isLoggedIn ? (
        <>
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 rounded-full bg-blue-600 text-white 
                     border border-blue-700 hover:bg-blue-700 
                     transition-all duration-300 shadow-lg"
            disabled={saveClicked}
          >
            {saveClicked ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => setShowSignOut(!showSignOut)}
            className="px-4 py-2 rounded-full bg-gray-600 text-white 
                     border border-gray-700 hover:bg-gray-700 
                     transition-all duration-300 shadow-lg"
          >
            {showSignOut ? 'Cancel' : 'Sign Out'}
          </button>
          <AnimatePresence>
            {showSignOut && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-4 rounded-lg shadow-lg mt-2"
              >
                <p className="text-gray-700 mb-4">Are you sure you want to sign out?</p>
                <div className="flex gap-2">
                  <button
                onClick={handleAuth}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Yes, Sign Out
                  </button>
                  <button
                    onClick={() => setShowSignOut(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <button
          onClick={handleAuth}
          className="px-4 py-2 rounded-full bg-blue-600 text-white 
                   border border-blue-700 hover:bg-blue-700 
                   transition-all duration-300 shadow-lg"
        >
          Sign In
        </button>
      )}
    </motion.div>
  );
} 