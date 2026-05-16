import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, TrendingUp, Wallet, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Buy = () => {
  const { type, id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    fetchItem();
  }, [type, id]);

  const fetchItem = async () => {
    try {
      const endpoint = type === 'stock' ? 'stocks' : 'mutual-funds';
      const response = await axios.get(`http://localhost:5001/api/${endpoint}/${id}`);
      setItem(response.data);
    } catch (error) {
      console.error('Error fetching item:', error);
      setError('Failed to load investment details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!quantity || quantity < 1) {
      setFieldError('Quantity must be at least 1');
      return false;
    }
    if (quantity > 10000) {
      setFieldError('Quantity cannot exceed 10,000');
      return false;
    }
    setFieldError('');
    return true;
  };

  const handleBuy = async () => {
    setError('');
    setFieldError('');

    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    try {
      const price = type === 'stock' ? item.price : item.nav;
      await axios.post(`http://localhost:5001/api/portfolio/${user.id}/buy`, {
        type,
        itemId: parseInt(id),
        quantity,
        price
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error buying:', error);
      setError('Failed to complete purchase. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Successful!</h2>
          <p className="text-gray-600">Your investment has been added to your portfolio.</p>
        </div>
      </div>
    );
  }

  const price = type === 'stock' ? item?.price : item?.nav;
  const total = price * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{item?.name}</h1>
                <p className="text-white/80">{type === 'stock' ? item?.symbol : item?.category}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Current Price</p>
                <p className="text-2xl font-bold text-gray-900">₹{price?.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Type</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{type === 'stock' ? 'Stock' : 'Mutual Fund'}</p>
              </div>
            </div>

            {type === 'mutual-fund' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600">1Y Returns</p>
                  <p className="text-lg font-bold text-green-600">{item?.returns['1Y']}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600">3Y Returns</p>
                  <p className="text-lg font-bold text-green-600">{item?.returns['3Y']}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600">5Y Returns</p>
                  <p className="text-lg font-bold text-green-600">{item?.returns['5Y']}%</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  fieldError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldError && (
                <p className="text-red-600 text-sm mt-1">{fieldError}</p>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Total Investment</span>
                <span className="text-3xl font-bold text-gray-900">₹{total?.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Wallet className="w-4 h-4" />
                <span>₹{quantity} × ₹{price?.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={processing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? 'Processing...' : `Confirm ${type === 'stock' ? 'Purchase' : 'Investment'}`}
              {!processing && <TrendingUp className="w-5 h-5" />}
            </button>

            <p className="text-center text-sm text-gray-500">
              By confirming, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Buy;
