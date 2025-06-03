import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ViewPlan = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
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
        setSubscriptions(data.subscriptions || []);

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
    if (!selectedSubscription) return;

    try {
      setCancelling(true);
      const response = await fetch('/api/auth/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subscriptionId: selectedSubscription.id
        })
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
          setSubscriptions(subData.subscriptions || []);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
      setSelectedSubscription(null);
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

  if (!subscriptions.length) {
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Subscriptions</h1>
        
        {/* Domain Information */}
        {domain && (
          <div className="mb-8 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Your Domain</h3>
              <p className="mt-1 text-sm text-gray-600">{domain}</p>
            </div>
          </div>
        )}

        {/* Subscriptions List */}
        <div className="space-y-6">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  {/* Plan Type */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {subscription.planType === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}
                    </p>
                  </div>

                  {/* Payment Dates */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-gray-900">Payment Schedule</h3>
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Payment</p>
                        <p className="mt-1 text-sm text-gray-600">
                          {formatDate(subscription.currentPeriodStart)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Next Payment</p>
                        <p className="mt-1 text-sm text-gray-600">
                          {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Status */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Status</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {subscription.status === 'active' ? 'Active' : 'Trialing'}
                      </span>
                      {subscription.status === 'trialing' && (
                        <span className="text-sm text-gray-600">
                          You haven't been charged yet. You have 30 free days after which your card will be charged.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  {subscription.product && (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-900">Plan Details</h3>
                      <p className="mt-1 text-sm text-gray-600">{subscription.product.name}</p>
                      {subscription.product.description && (
                        <p className="mt-1 text-sm text-gray-500">{subscription.product.description}</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t pt-4 flex space-x-4">
                    <button
                      onClick={() => navigate('/initial-payment')}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Change Plan
                    </button>
                    {!subscription.cancelAtPeriodEnd && (
                      <button
                        onClick={() => {
                          setSelectedSubscription(subscription);
                          setShowCancelModal(true);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Return to OneForm Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/oneform')}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Return to OneForm
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedSubscription && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Subscription</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to cancel your {selectedSubscription.planType} subscription? This action is irreversible and your site will go down at the end of your current billing period ({formatDate(selectedSubscription.currentPeriodEnd)}).
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedSubscription(null);
                }}
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