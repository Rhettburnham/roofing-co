import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Get the API base URL based on environment
const API_BASE_URL = import.meta.env.DEV 
  ? 'https://auth-worker.roofing-www.workers.dev'
  : '';

export default function OneFormAuthButton() {
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
      setDebug('Checking auth status...');
      
      // Log the current cookies for debugging
      const cookies = document.cookie;
      setDebug(`Current cookies: ${cookies}`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
        method: 'GET',
        credentials: 'include', // This is crucial for sending cookies
        headers: {
          'Accept': 'application/json',
        },
      });

      setDebug(`Auth status response: ${response.status}`);
      setDebug(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      
      const data = await response.json();
      setDebug(`Auth status data: ${JSON.stringify(data)}`);
      
      if (data.isAuthenticated) {
        setIsLoggedIn(true);
        setDebug('Successfully authenticated');
      } else {
        setIsLoggedIn(false);
        setDebug('Not authenticated');
      }
    } catch (error) {
      setDebug(`Auth status error: ${error.message}`);
      console.error('Auth status check failed:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    if (isLoggedIn) {
      try {
        setDebug('Logging out...');
        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
        
        if (response.ok) {
          setIsLoggedIn(false);
          setShowSignOut(false);
          setDebug('Logged out successfully');
        } else {
          setDebug(`Logout failed with status: ${response.status}`);
        }
      } catch (error) {
        setDebug(`Logout error: ${error.message}`);
        console.error('Logout failed:', error);
      }
    } else {
      setDebug('Redirecting to login...');
      window.location.href = '/login';
    }
  };

  const handleSaveClick = () => {
    setSaveClicked(true);
    setTimeout(() => setSaveClicked(false), 1000);
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
          >
            {saveClicked ? 'Clicked!' : 'Save Changes'}
          </button>
          
          <motion.button
            onClick={() => setShowSignOut(!showSignOut)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            animate={{ rotate: showSignOut ? 180 : 0 }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </motion.button>

          <AnimatePresence>
            {showSignOut && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={handleAuth}
                className="px-4 py-2 rounded-full bg-red-600 text-white 
                         border border-red-700 hover:bg-red-700 
                         transition-all duration-300 shadow-lg"
              >
                Sign Out
              </motion.button>
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