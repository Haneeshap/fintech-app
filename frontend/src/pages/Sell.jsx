import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, TrendingDown, Wallet, CheckCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const Sell = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [holding, setHolding] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, [id, user]);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/portfolio/${user.id}`);
      const holdingData = response.data.holdings?.find(h => h.itemId === parseInt(id));
      setHolding(holdingData);
      if (holdingData) {
        setQuantity(holdingData.quantity);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!quantity || quantity < 1) {
      setFieldError('Quantity must be at least 1');
      return false;
    }
    if (quantity > holding.quantity) {
      setFieldError(`Cannot sell more than ${holding.quantity} units`);
      return false;
    }
    setFieldError('');
    return true;
  };

  const handleSell = async () => {
    setError('');
    setFieldError('');

    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    try {
      await axios.post(`http://localhost:5001/api/portfolio/${user.id}/sell`, {
        itemId: parseInt(id),
        quantity
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error selling:', error);
      setError('Failed to complete sale. Please try again.');
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

  if (!holding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Holding Not Found</h2>
          <p className="text-gray-600 mb-4">You don't own this investment.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sale Successful!</h2>
          <p className="text-gray-600">Your investment has been sold.</p>
        </div>
      </div>
    );
  }

  const total = quantity * holding.avgPrice;

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
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sell Investment</h1>
                <p className="text-white/80">ID: {holding.itemId}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Owned Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{holding.quantity}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Average Price</p>
                <p className="text-2xl font-bold text-gray-900">₹{holding.avgPrice?.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Sell
              </label>
              <input
                type="number"
                min="1"
                max={holding.quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, holding.quantity))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  fieldError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="text-sm text-gray-500 mt-1">Maximum: {holding.quantity}</p>
              {fieldError && (
                <p className="text-red-600 text-sm mt-1">{fieldError}</p>
              )}
            </div>

            <div className="bg-red-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Total Value</span>
                <span className="text-3xl font-bold text-gray-900">₹{total?.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Wallet className="w-4 h-4" />
                <span>₹{quantity} × ₹{holding.avgPrice?.toFixed(2)}</span>
              </div>
            </div>

            {quantity === holding.quantity && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  You are selling your entire holding in this investment.
                </p>
              </div>
            )}

            <button
              onClick={handleSell}
              disabled={processing}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? 'Processing...' : 'Confirm Sale'}
              {!processing && <TrendingDown className="w-5 h-5" />}
            </button>

            <p className="text-center text-sm text-gray-500">
              This action cannot be undone
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sell;
