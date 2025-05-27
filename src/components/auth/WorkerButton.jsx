import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WorkerButton() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkWorkerStatus();
  }, []);

  const checkWorkerStatus = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include',
      });
      const data = await response.json();
      setIsAuthorized(data.configId === 'worker' || data.configId === 'admin');
    } catch (error) {
      console.error('Error checking worker status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !isAuthorized) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={() => window.location.href = '/worker'}
      className="px-4 py-2 rounded-full bg-green-600 text-white 
               border border-green-700 hover:bg-green-700 
               transition-all duration-300 shadow-lg mt-2"
    >
      Worker Panel
    </motion.button>
  );
} 