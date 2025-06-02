import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Hardcoded values
const STRIPE_PUBLIC_KEY = 'sk_test_51RUbGWChVcyXd9OluNojZTbLrzLmbTU72nNCeED8c7dpiz9gTu39XznRSCiJMwfT3LBVIxT1mt7qEPRcoUW2rKqi00oaUUwn6g'; // Corrected typo in key if any

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!stripe || !elements) {
        throw new Error('Stripe not initialized');
      }

      // Get form data
      const formData = new FormData(e.target);
      const billingDetails = {
        name: `${formData.get('firstName')} ${formData.get('lastName')}`,
        address: {
          line1: formData.get('address'),
          city: formData.get('city'),
          state: formData.get('state'),
          postal_code: formData.get('postalCode'),
          country: formData.get('country'),
        },
      };

      // Get the card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create subscription with default_incomplete
      const response = await fetch('/api/auth/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          priceId: selectedPlan === 'monthly' ? MONTHLY_PRICE_ID : YEARLY_PRICE_ID,
          planType: selectedPlan,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to create subscription');
      }

      // Destructure clientSecret, subscriptionId, and status from the response
      const { clientSecret, subscriptionId, status, message } = await response.json();

      // --- IMPORTANT CHANGE HERE ---
      if (clientSecret) {
        // If clientSecret is present, confirm the payment
        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: billingDetails
          }
        });

        if (confirmError) {
          throw new Error(confirmError.message);
        }

        // Payment successful, redirect to success page
        navigate('/payment-success', { 
          state: { 
            subscriptionId,
            planType: selectedPlan,
            status: 'active' // Assuming payment is now active after confirmation
          } 
        });
      } else if (status === 'active' || status === 'trialing') {
        // If no clientSecret, but subscription is active or trialing, it's a success
        console.log('Subscription created successfully:', message);
        navigate('/payment-success', { 
          state: { 
            subscriptionId,
            planType: selectedPlan,
            status: status // Pass the actual status
          } 
        });
      } else {
        // This case indicates an unexpected scenario where clientSecret is missing
        // and the subscription is not active/trialing (e.g., still incomplete without PI)
        throw new Error(message || 'No client secret received and subscription not active/trialing.');
      }
      // --- END IMPORTANT CHANGE ---

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
          
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Address Fields */}
          <div className="space-y-4 mb-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card Element */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>
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

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Subscribe ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'}`}
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

          {prices.monthly.amount > 0 && (
            <Elements stripe={stripePromise}>
              <CheckoutForm selectedPlan={selectedPlan} prices={prices} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default InitialPayment;
