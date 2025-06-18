import React, { useState } from 'react';

export default function AssignBBBData({ currentUserEmail }) {
  const [availableRows, setAvailableRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workerEmail, setWorkerEmail] = useState(currentUserEmail || '');
  const [startRow, setStartRow] = useState('');
  const [endRow, setEndRow] = useState('');
  const [mode, setMode] = useState('retrieve'); // 'retrieve' or 'set'
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAvailableLeads = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/bbb-data-available', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch available leads');
      setAvailableRows(data.availableRows);
      setMode('set');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/bbb-data-assign', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerEmail,
          startRow: Number(startRow),
          endRow: Number(endRow),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign worker');
      setMessage(data.message || 'Worker assigned successfully!');
      setStartRow('');
      setEndRow('');
      setAvailableRows(null);
      setMode('retrieve');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 mb-6 bg-blue-50 rounded-lg shadow">
      <h2 className="text-lg font-bold mb-2">Assign BBB Data</h2>
      <div className="mb-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={fetchAvailableLeads}
          disabled={loading || mode === 'set'}
        >
          Show Available Leads
        </button>
      </div>
      {availableRows && (
        <div className="mb-2 text-sm text-gray-700">
          <strong>Available Rows:</strong> {availableRows}
        </div>
      )}
      {mode === 'set' && (
        <form onSubmit={handleAssign} className="space-y-2 mt-2">
          <div>
            <label className="block text-sm font-medium">Worker Email</label>
            <input
              type="email"
              className="w-full px-2 py-1 border rounded"
              value={workerEmail}
              onChange={e => setWorkerEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium">Start Row</label>
              <input
                type="number"
                className="w-full px-2 py-1 border rounded"
                value={startRow}
                onChange={e => setStartRow(e.target.value)}
                required
                min={1}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">End Row</label>
              <input
                type="number"
                className="w-full px-2 py-1 border rounded"
                value={endRow}
                onChange={e => setEndRow(e.target.value)}
                required
                min={startRow || 1}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              Assign Worker
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => { setMode('retrieve'); setAvailableRows(null); setMessage(''); setError(''); }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {message && <div className="mt-2 text-green-700">{message}</div>}
      {error && <div className="mt-2 text-red-600">{error}</div>}
    </div>
  );
} 