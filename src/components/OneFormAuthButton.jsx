import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
      console.log("OneFormAuthButton: Starting auth status check...");
      setDebug('Checking auth status...');
      
      // Log the current cookies for debugging
      const cookies = document.cookie;
      console.log("OneFormAuthButton: Current cookies:", cookies);
      setDebug(`Current cookies: ${cookies}`);
      
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log("OneFormAuthButton: Auth status response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      setDebug(`Auth status response: ${response.status}`);
      setDebug(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      
      const data = await response.json();
      console.log("OneFormAuthButton: Auth status data:", data);
      setDebug(`Auth status data: ${JSON.stringify(data)}`);
      
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
        
        console.log("OneFormAuthButton: Logout response:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
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