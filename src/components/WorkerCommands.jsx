import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WorkerCommands({ currentFolder }) {
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [domainStatus, setDomainStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [configStatus, setConfigStatus] = useState(null);

  // Check config status when folder changes
  useEffect(() => {
    if (currentFolder) {
      checkConfigStatus();
    }
  }, [currentFolder]);

  // Check domain status when email changes or when config has domain
  useEffect(() => {
    if (currentFolder) {
      if (email || configStatus?.configHasDomain) {
        checkDomainStatus();
      }
    }
  }, [email, currentFolder, configStatus?.configHasDomain]);

  const checkConfigStatus = async () => {
    setCheckingStatus(true);
    setError('');
    try {
      const response = await fetch('/api/admin/check-domain', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configId: currentFolder
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to check config status');
      }

      setConfigStatus(data);
      if (data.exists) {
        setDomainStatus(data);
      }
    } catch (error) {
      setError(error.message);
      setConfigStatus(null);
    } finally {
      setCheckingStatus(false);
    }
  };

  const checkDomainStatus = async (emailToUse = email) => {
    setCheckingStatus(true);
    setError('');
    try {
      const response = await fetch('/api/admin/check-domain', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailToUse || '',  // Use provided email or state email
          configId: currentFolder
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to check domain status');
      }

      console.log('Domain status response:', data); // Add debug logging
      setDomainStatus(data);
    } catch (error) {
      console.error('Error checking domain status:', error); // Add debug logging
      setError(error.message);
      setDomainStatus(null);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/workerCommands', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'addDomain',
          email,
          domain,
          currentFolder
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to add domain');
      }

      setSuccess('Domain entry added successfully');
      setEmail('');
      setDomain('');
      setDomainStatus(null);
      checkConfigStatus(); // Refresh config status after adding
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentFolder) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Navigate into a folder to access worker commands</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold mb-4">Worker Commands</h2>
      <div className="mb-4 space-y-2">
        <p className="text-sm text-gray-600">
          Current folder: <span className="font-medium">{currentFolder}</span>
        </p>
        <p className="text-sm text-gray-600">
          Config ID: <span className="font-medium bg-gray-100 px-2 py-1 rounded">{currentFolder}</span>
        </p>
        {configStatus?.configHasDomain && (
          <div className="mt-2 p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm">
            <p className="font-medium">Note:</p>
            <p>This config already has a domain assigned. You can only have one domain per config.</p>
          </div>
        )}
        {!configStatus?.configHasDomain && (
          <div className="mt-2 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
            <p className="font-medium">Note:</p>
            <p>The email used must be registered in the system first. If you get a foreign key error, please ensure the user has signed up with this email address.</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {checkingStatus ? (
          <div className="text-sm text-gray-600">Checking status...</div>
        ) : domainStatus?.exists ? (
          <div className="p-4 bg-gray-50 rounded-md space-y-2">
            <h3 className="font-medium text-gray-900">Domain Status</h3>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-gray-600">Email:</span>{' '}
                <span className="font-medium">{domainStatus.email}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Domain:</span>{' '}
                <span className="font-medium">{domainStatus.domain}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Payment Status:</span>{' '}
                <span className={`font-medium ${domainStatus.is_paid === 1 ? 'text-green-600' : 'text-red-600'}`}>
                  {domainStatus.is_paid === 1 ? 'Paid' : 'Unpaid'}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Domain Purchase:</span>{' '}
                <span className={`font-medium ${domainStatus.domain_purchased === 1 ? 'text-green-600' : 'text-red-600'}`}>
                  {domainStatus.domain_purchased === 1 ? 'Purchased' : 'Not Purchased'}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Created: {new Date(domainStatus.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : !configStatus?.configHasDomain ? (
          <>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                Domain
              </label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example.com"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
                {success}
              </div>
            )}

            <button
              type="button"
              onClick={handleAddDomain}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Adding...' : 'Add Domain Entry'}
            </button>
          </>
        ) : (
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">This config already has a domain assigned. Please use a different config folder.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
} 