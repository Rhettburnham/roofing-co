import React, { useState, useEffect } from 'react';

export default function WorkerBBBLeads({ currentUserEmail, onSelectEntry, showEditor = true }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (!currentUserEmail) return;
    setLoading(true);
    setError('');
    fetch(`/api/admin/bbb-data-available?workerEmail=${encodeURIComponent(currentUserEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setLeads(data.leads || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentUserEmail]);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleSelect = (entry) => {
    setSelected(entry);
    setTimer(0);
    setTimerActive(true);
    if (onSelectEntry) onSelectEntry(entry);
  };

  const handleRelease = () => {
    setSelected(null);
    setTimer(0);
    setTimerActive(false);
    if (onSelectEntry) onSelectEntry(null);
  };

  if (loading) return <div className="p-4">Loading leads...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  if (!selected) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg mb-6">
        <h2 className="text-lg font-bold mb-2">Your Assigned BBB Leads</h2>
        {leads.length === 0 ? (
          <div>No leads assigned to your email.</div>
        ) : (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Business Name</th>
                <th className="p-2 border">Contact Status</th>
                <th className="p-2 border">Config ID</th>
                <th className="p-2 border">Google Reviews</th>
                <th className="p-2 border">Select</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(entry => (
                <tr key={entry.id} className="border-b">
                  <td className="p-2 border">{entry.id}</td>
                  <td className="p-2 border">{entry.business_name}</td>
                  <td className="p-2 border">{entry.contact_status}</td>
                  <td className="p-2 border">{entry.config_id}</td>
                  <td className="p-2 border">
                    {entry.google_reviews_link ? (
                      <a href={entry.google_reviews_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Link</a>
                    ) : 'N/A'}
                  </td>
                  <td className="p-2 border">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => handleSelect(entry)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // Show only the selected entry and timer, but do not render BBBDataEditor here
  return (
    <div className="p-4 bg-green-50 rounded-lg mb-6">
      <h2 className="text-lg font-bold mb-2">Selected BBB Lead</h2>
      <div className="mb-2 flex items-center gap-4">
        <span className="font-semibold">ID:</span> <span>{selected.id}</span>
        <span className="font-semibold">Business:</span> <span>{selected.business_name}</span>
        <span className="font-semibold">Contact Status:</span> <span>{selected.contact_status}</span>
        <span className="font-semibold">Config ID:</span> <span>{selected.config_id}</span>
        <span className="font-semibold">Timer:</span> <span className="text-lg text-blue-600">{timer}s</span>
        <button className="ml-4 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400" onClick={handleRelease}>Release</button>
      </div>
      {/* The selected entry's data is available here for passing to the folder detail page via onSelectEntry */}
    </div>
  );
} 