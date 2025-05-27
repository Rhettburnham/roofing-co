import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include',
      });
      const data = await response.json();
      setIsAdmin(data.configId === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !isAdmin) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={() => window.location.href = '/admin'}
      className="px-4 py-2 rounded-full bg-purple-600 text-white 
               border border-purple-700 hover:bg-purple-700 
               transition-all duration-300 shadow-lg mt-2"
    >
      Admin Panel
    </motion.button>
  );
} 