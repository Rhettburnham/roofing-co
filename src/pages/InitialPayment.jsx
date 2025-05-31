import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Hardcoded values
const STRIPE_PUBLIC_KEY = 'pk_test_51RUbGWChVcyXd9Ol8qNavRytBxxJoZC0uofeMJdmnqfhASWXTFiQLYuTsG5N3713Bm9zPkn9cFQJBqIMQQoWSRPs00uFRzrHpV';
const MONTHLY_PRICE_ID = 'prod_SPQCEDY9mS3vI3';
const YEARLY_PRICE_ID = 'prod_SPQDERFJ8Ve82B';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// Checkout Form Component
const CheckoutForm = ({ selectedPlan, prices }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (submitError) {
        setError(submitError.message);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error}
              </h3>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ${selectedPlan === 'monthly' ? prices.monthly.amount / 100 : prices.yearly.amount / 100}`}
      </button>
    </form>
  );
};

const InitialPayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [prices, setPrices] = useState({
    monthly: { amount: 0, currency: 'usd' },
    yearly: { amount: 0, currency: 'usd' }
  });
  const [clientSecret, setClientSecret] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/status', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        const data = await response.json();
        if (!data.isAuthenticated) {
          navigate('/login');
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch prices and create payment intent
  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Fetch prices
        const pricesResponse = await fetch('/api/auth/get-prices', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!pricesResponse.ok) {
          throw new Error('Failed to fetch prices');
        }

        const pricesData = await pricesResponse.json();
        setPrices(pricesData);

        // Create payment intent
        const intentResponse = await fetch('/api/auth/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: selectedPlan === 'monthly' ? MONTHLY_PRICE_ID : YEARLY_PRICE_ID,
            planType: selectedPlan,
          }),
          credentials: 'include',
        });

        if (!intentResponse.ok) {
          throw new Error('Failed to create payment intent');
        }

        const { clientSecret } = await intentResponse.json();
        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Error initializing payment:', err);
        setError('Failed to initialize payment');
      }
    };

    if (isAuthenticated) {
      initializePayment();
    }
  }, [selectedPlan, isAuthenticated]);

  const formatPrice = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Please log in to continue
          </h2>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Choose Your Plan
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select a subscription plan that works for you
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {/* Monthly Plan */}
          <div 
            className={`relative rounded-lg border p-4 cursor-pointer ${
              selectedPlan === 'monthly' 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-300'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Monthly Plan</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Billed monthly, cancel anytime
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(prices.monthly.amount)}/mo
                </p>
              </div>
            </div>
          </div>

          {/* Yearly Plan */}
          <div 
            className={`relative rounded-lg border p-4 cursor-pointer ${
              selectedPlan === 'yearly' 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-300'
            }`}
            onClick={() => setSelectedPlan('yearly')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Yearly Plan</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Save 20% with annual billing
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(prices.yearly.amount)}/yr
                </p>
                <p className="text-sm text-gray-500">
                  {formatPrice(prices.yearly.amount / 12)}/mo
                </p>
              </div>
            </div>
          </div>

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm selectedPlan={selectedPlan} prices={prices} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default InitialPayment; 