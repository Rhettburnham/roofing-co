import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscriptionId, planType, status } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Payment Successful!
            </h2>

            <div className="mt-4 text-sm text-gray-600">
              {status === 'trialing' ? (
                <p>Your 30-day free trial has started. Enjoy your subscription!</p>
              ) : (
                <p>Your subscription has been activated successfully.</p>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>Subscription ID: {subscriptionId}</p>
              <p>Plan: {planType === 'monthly' ? 'Monthly' : 'Yearly'}</p>
              <p>Status: {status}</p>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={() => navigate('/oneform')}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Start Editing
              </button>
              <button
                onClick={() => navigate('/view-plan')}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                View Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 