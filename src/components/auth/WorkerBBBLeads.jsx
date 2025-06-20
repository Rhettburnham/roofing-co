import React, { useState, useEffect } from 'react';

export default function WorkerBBBLeads({ currentUserEmail, onSelectEntry, showEditor = true }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [contactStatusFilter, setContactStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'name_asc', 'name_desc'

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

  // Update parent with live timer value
  useEffect(() => {
    if (selected && onSelectEntry) {
      onSelectEntry(selected, timer);
    }
  }, [timer, selected, onSelectEntry]);

  // Filter and sort leads
  const filteredAndSortedLeads = React.useMemo(() => {
    let filtered = leads;
    
    // Filter by contact status
    if (contactStatusFilter) {
      filtered = filtered.filter(lead => lead.contact_status === contactStatusFilter);
    }
    
    // Sort leads
    let sorted = [...filtered];
    if (sortBy === 'name_asc') {
      sorted.sort((a, b) => (a.business_name || '').localeCompare(b.business_name || ''));
    } else if (sortBy === 'name_desc') {
      sorted.sort((a, b) => (b.business_name || '').localeCompare(a.business_name || ''));
    }
    // Default sorting is by ID (already implemented in the original data)
    
    return sorted;
  }, [leads, contactStatusFilter, sortBy]);

  const handleSelect = (entry) => {
    setSelected(entry);
    setTimer(0);
    setTimerActive(true);
    if (onSelectEntry) onSelectEntry(entry, 0);
  };

  const handleRelease = () => {
    setSelected(null);
    setTimer(0);
    setTimerActive(false);
    if (onSelectEntry) onSelectEntry(null, 0);
  };

  const handleSortToggle = () => {
    if (sortBy === 'default') {
      setSortBy('name_asc');
    } else if (sortBy === 'name_asc') {
      setSortBy('name_desc');
    } else {
      setSortBy('default');
    }
  };

  if (loading) return <div className="p-4">Loading leads...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  if (!selected) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg mb-6">
        <h2 className="text-lg font-bold mb-2">Your Assigned BBB Leads</h2>
        
        {/* Filters */}
        <div className="mb-4 flex gap-4 items-center">
          <div>
            <label htmlFor="contactStatusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Contact Status:
            </label>
            <select
              id="contactStatusFilter"
              value={contactStatusFilter}
              onChange={(e) => setContactStatusFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="not_contacted">Not Contacted</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="no_response">No Response</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedLeads.length} of {leads.length} leads
          </div>
        </div>
        
        {leads.length === 0 ? (
          <div>No leads assigned to your email.</div>
        ) : (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">
                  <button
                    onClick={handleSortToggle}
                    className="flex items-center gap-1 w-full justify-center hover:bg-gray-200 rounded px-1"
                    title="Click to sort by business name"
                  >
                    Business Name
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        sortBy === 'name_desc' ? 'rotate-180' : 
                        sortBy === 'name_asc' ? 'rotate-0' : 'opacity-50'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </th>
                <th className="p-2 border">Contact Status</th>
                <th className="p-2 border">Config ID</th>
                <th className="p-2 border">Google Reviews</th>
                <th className="p-2 border">Select</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedLeads.map(entry => (
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