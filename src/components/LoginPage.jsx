import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDebug('Starting login process...');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      setDebug(`Sending request to: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      setDebug(`Response status: ${response.status}`);
      const responseText = await response.text();
      setDebug(`Response text: ${responseText}`);

      let data;
      try {
        data = JSON.parse(responseText);
        setDebug(`Parsed data: ${JSON.stringify(data)}`);
      } catch (parseError) {
        setDebug(`Parse error: ${parseError.message}`);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      setDebug('Login successful, redirecting...');
      // Redirect to OneForm page on success
      window.location.href = '/oneform';
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication');
      setDebug(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Debug information */}
        {debug && (
          <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded mb-4 text-sm">
            <pre>{debug}</pre>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
              placeholder="Enter your password"
              minLength={8}
            />
            {!isLogin && (
              <p className="text-sm text-gray-500 mt-1">
                Password must be at least 8 characters long
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
} 