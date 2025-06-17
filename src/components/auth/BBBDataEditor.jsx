import { useState } from 'react';
import { motion } from 'framer-motion';

export default function BBBDataEditor({ currentFolder, currentUserEmail }) {
  const [formData, setFormData] = useState({
    id: '',
    website: '',
    address: '',
    contact_status: '',
    email: '',
    worker: currentUserEmail || '',
    config_id: currentFolder || '',
    notes: '',
    timer: 60
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate required fields
    if (!formData.id) {
      setError('ID is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/workerCommands', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'editBBBData',
          id: formData.id,
          website: formData.website || undefined,
          address: formData.address || undefined,
          contact_status: formData.contact_status || undefined,
          email: formData.email || undefined,
          worker: formData.worker || undefined,
          config_id: formData.config_id || undefined,
          notes: formData.notes || undefined,
          timer: formData.timer || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to update BBB data');
      }

      setSuccess(`BBB data entry updated successfully! Updated ${data.updatedFields} field(s).`);
      // Reset form except for autofilled fields
      setFormData({
        id: '',
        website: '',
        address: '',
        contact_status: '',
        email: '',
        worker: currentUserEmail || '',
        config_id: currentFolder || '',
        notes: '',
        timer: 60
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentFolder) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Navigate into a folder to access BBB data editor</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold mb-4">Edit BBB Data Entry</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
            Entry ID <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="id"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter BBB data entry ID"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter business address"
          />
        </div>

        <div>
          <label htmlFor="contact_status" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Status
          </label>
          <select
            id="contact_status"
            name="contact_status"
            value={formData.contact_status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select status</option>
            <option value="not_contacted">Not Contacted</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="no_response">No Response</option>
          </select>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Business Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="business@example.com"
          />
        </div>

        <div>
          <label htmlFor="worker" className="block text-sm font-medium text-gray-700 mb-1">
            Worker Email
          </label>
          <input
            type="email"
            id="worker"
            name="worker"
            value={formData.worker}
            onChange={handleInputChange}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-600 cursor-not-allowed"
            placeholder="worker@example.com"
            title="Auto-filled with current user email"
          />
        </div>

        <div>
          <label htmlFor="config_id" className="block text-sm font-medium text-gray-700 mb-1">
            Config ID
          </label>
          <input
            type="text"
            id="config_id"
            name="config_id"
            value={formData.config_id}
            onChange={handleInputChange}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-600 cursor-not-allowed"
            placeholder="Config ID"
            title="Auto-filled with current folder"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes about this business..."
          />
        </div>

        <div>
          <label htmlFor="timer" className="block text-sm font-medium text-gray-700 mb-1">
            Timer (minutes)
          </label>
          <input
            type="number"
            id="timer"
            name="timer"
            value={formData.timer}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
            title="Timer is auto-set to 60 minutes and cannot be edited"
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
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Updating...' : 'Update BBB Data Entry'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
        <p className="font-medium">Note:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Only fields with values will be updated</li>
          <li>Worker email and Config ID are auto-filled from your current session</li>
          <li>Entry ID is required to identify which record to update</li>
        </ul>
      </div>
    </motion.div>
  );
} 