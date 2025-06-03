import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ViewPlan = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [domain, setDomain] = useState(null);
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

        // Fetch domain information
        const domainResponse = await fetch('/api/auth/get-domain', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (domainResponse.ok) {
          const domainData = await domainResponse.json();
          setDomain(domainData.domain);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, []);

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      const response = await fetch('/api/auth/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      const data = await response.json();
      if (data.success) {
        // Refresh subscription data
        const subResponse = await fetch('/api/auth/get-subscription', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (subResponse.ok) {
          const subData = await subResponse.json();
          setSubscription(subData);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

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

  if (!subscription?.hasSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Subscriptions</h2>
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
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const { subscription: subData } = subscription;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Subscription</h1>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* Domain Information */}
              {domain && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900">Your Domain</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {domain}
                  </p>
                </div>
              )}

              {/* Plan Type */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {subData.planType === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}
                </p>
              </div>

              {/* Payment Dates */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium text-gray-900">Payment Schedule</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Payment</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatDate(subData.currentPeriodStart)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Next Payment</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatDate(subData.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Status */}
              <div>
                <h3 className="text-lg font-medium text-gray-900">Status</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {subData.status ? subData.status.charAt(0).toUpperCase() + subData.status.slice(1) : 'Active'}
                  {subData.cancelAtPeriodEnd && ' (Cancelling at period end)'}
                </p>
              </div>

              {/* Product Details */}
              {subData.product && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900">Plan Details</h3>
                  <p className="mt-1 text-sm text-gray-600">{subData.product.name}</p>
                  {subData.product.description && (
                    <p className="mt-1 text-sm text-gray-500">{subData.product.description}</p>
                  )}
                </div>
              )}
            </div>
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
          {!subData.cancelAtPeriodEnd && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Cancel Subscription
            </button>
          )}
          <button
            onClick={() => navigate('/oneform')}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Return to OneForm
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Subscription</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to cancel your subscription? This action is irreversible and your site will go down at the end of your current billing period.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={cancelling}
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPlan; 