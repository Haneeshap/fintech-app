import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, Calculator, CheckCircle, Info } from 'lucide-react';
import axios from 'axios';

const SIP = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [fund, setFund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [sipData, setSipData] = useState({
    amount: 500,
    frequency: 'monthly',
    startDate: '',
    duration: 12
  });
  
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFund();
  }, [user, navigate, id]);

  const fetchFund = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/mutual-funds/${id}`);
      setFund(response.data);
      // Set default start date to next month
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setSipData({ ...sipData, startDate: nextMonth.toISOString().split('T')[0] });
    } catch (error) {
      console.error('Error fetching fund:', error);
      setError('Failed to load fund details');
    } finally {
      setLoading(false);
    }
  };

  const calculateReturns = () => {
    const monthlyAmount = sipData.amount;
    const duration = sipData.duration; // in months
    const expectedReturn = fund?.returns['1Y'] / 100 / 12; // monthly return rate
    
    const totalInvestment = monthlyAmount * duration;
    const futureValue = monthlyAmount * ((Math.pow(1 + expectedReturn, duration) - 1) / expectedReturn) * (1 + expectedReturn);
    const estimatedReturns = futureValue - totalInvestment;
    
    return {
      totalInvestment,
      futureValue,
      estimatedReturns
    };
  };

  const validateForm = () => {
    if (!sipData.amount || sipData.amount < 500) {
      setFieldError('Minimum SIP amount is ₹500');
      return false;
    }
    if (sipData.amount > 100000) {
      setFieldError('Maximum SIP amount is ₹1,00,000');
      return false;
    }
    if (!sipData.startDate) {
      setFieldError('Start date is required');
      return false;
    }
    if (!sipData.duration || sipData.duration < 1) {
      setFieldError('Duration must be at least 1 month');
      return false;
    }
    if (sipData.duration > 360) {
      setFieldError('Maximum duration is 360 months (30 years)');
      return false;
    }
    setFieldError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');

    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    try {
      // Simulate API call to create SIP
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating SIP:', error);
      setError('Failed to create SIP. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const returns = calculateReturns();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SIP details...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">SIP Created Successfully!</h2>
          <p className="text-gray-600">Your systematic investment plan has been set up.</p>
          <p className="text-sm text-gray-500 mt-2">Your first SIP will be deducted on {sipData.startDate}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Set up SIP</h1>
          <p className="text-gray-600 mt-2">Systematic Investment Plan for {fund?.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SIP Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{fund?.name}</h2>
                  <p className="text-white/80">{fund?.category}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SIP Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="500"
                    max="100000"
                    step="500"
                    value={sipData.amount}
                    onChange={(e) => setSipData({ ...sipData, amount: parseInt(e.target.value) || 500 })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                      fieldError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <p className="text-sm text-gray-500 mt-1">Min: ₹500 | Max: ₹1,00,000</p>
                  {fieldError && <p className="text-red-600 text-sm mt-1">{fieldError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={sipData.frequency}
                    onChange={(e) => setSipData({ ...sipData, frequency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={sipData.startDate}
                    onChange={(e) => setSipData({ ...sipData, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={sipData.duration}
                    onChange={(e) => setSipData({ ...sipData, duration: parseInt(e.target.value) || 12 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">Max: 360 months (30 years)</p>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? 'Creating SIP...' : 'Create SIP'}
                  {!processing && <TrendingUp className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </div>

          {/* SIP Calculator */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">SIP Calculator</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Total Investment</p>
                  <p className="text-2xl font-bold text-gray-900">₹{returns.totalInvestment.toLocaleString()}</p>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Estimated Returns</p>
                  <p className="text-2xl font-bold text-green-600">₹{returns.estimatedReturns.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Future Value</p>
                  <p className="text-2xl font-bold text-blue-600">₹{returns.futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">About SIP</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Systematic Investment Plan allows you to invest a fixed amount regularly in mutual funds. 
                    It helps in rupee cost averaging and building wealth over time.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Fund Performance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">1Y</p>
                  <p className="text-lg font-bold text-green-600">{fund?.returns['1Y']}%</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">3Y</p>
                  <p className="text-lg font-bold text-green-600">{fund?.returns['3Y']}%</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">5Y</p>
                  <p className="text-lg font-bold text-green-600">{fund?.returns['5Y']}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SIP;
