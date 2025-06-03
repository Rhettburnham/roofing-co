import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ViewPlan = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        const response = await fetch('/api/auth/get-subscription', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscription details');
        }

        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Subscription</h2>
          <button
            onClick={() => navigate('/initial-payment')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Subscription Details</h2>
            
            <div className="space-y-6">
              {/* Plan Type */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {subscription.planType === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}
                </p>
              </div>

              {/* Signup Date */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium text-gray-900">Signup Date</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {formatDate(subscription.created)}
                </p>
              </div>

              {/* Next Payment */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium text-gray-900">Next Payment</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {subscription.status === 'trialing' 
                    ? `Trial ends on ${formatDate(subscription.trial_end)}`
                    : formatDate(subscription.current_period_end)}
                </p>
              </div>

              {/* Domain Name */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium text-gray-900">Domain Name</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {subscription.metadata?.domainName || 'Not set'}
                </p>
              </div>

              {/* Subscription Status */}
              <div>
                <h3 className="text-lg font-medium text-gray-900">Status</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => navigate('/initial-payment')}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Change Plan
              </button>
              <button
                onClick={() => navigate('/oneform')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Return to OneForm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPlan; 