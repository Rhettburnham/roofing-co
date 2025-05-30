import React, { useState, useEffect } from 'react';

const WorkerPage = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkWorkerAccess();
  }, []);

  const checkWorkerAccess = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.configId !== 'worker' && data.configId !== 'admin') {
        // Redirect unauthorized users
        window.location.href = '/';
        return;
      }
      
      setIsAuthorized(true);
    } catch (error) {
      console.error('Error checking worker access:', error);
      window.location.href = '/';
    } finally {
      setCheckingAuth(false);
    }
  };

  const checkDomain = async () => {
    if (!domain) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/check-domain?domain=${encodeURIComponent(domain)}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to check domain');
      }
      
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You are not authorized to view this page.</p>
          <p className="text-sm text-gray-500">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Domain Checker</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            className="flex-1 p-2 border rounded"
            placeholder="Enter domain (e.g., example.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkDomain()}
          />
          <button 
            className={`px-4 py-2 rounded text-white ${
              loading || !domain ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={checkDomain}
            disabled={loading || !domain}
          >
            {loading ? 'Checking...' : 'Check'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {results && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Results for {results.originalDomain.name}
          </h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Original Domain Status:</h3>
            <p>
              {results.originalDomain.available ? '✅ Available' : '❌ Not Available'}
              {results.originalDomain.price && ` - $${results.originalDomain.price} ${results.originalDomain.currency}`}
            </p>
          </div>

          {results.alternatives.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Affordable Alternatives:</h3>
              <ul className="divide-y">
                {results.alternatives.map((alt, index) => (
                  <li key={index} className="py-2">
                    <div className="font-medium">{alt.name}</div>
                    <div className="text-gray-600">${alt.price} {alt.currency}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerPage; 