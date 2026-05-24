import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, Calculator, CheckCircle, Info, LineChart, Zap } from 'lucide-react';
import axios from 'axios';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

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
    duration: 12,
    stepUp: false,
    stepUpPercentage: 10
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
      const response = await axios.get(`http://localhost:5001/api/mutual-funds/${id}`);
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
    
    let totalInvestment = 0;
    let futureValue = 0;
    const projectionData = [];
    
    for (let month = 1; month <= duration; month++) {
      let currentAmount = monthlyAmount;
      
      // Apply step-up if enabled
      if (sipData.stepUp && month > 1 && month % 12 === 0) {
        const yearsPassed = Math.floor(month / 12);
        currentAmount = monthlyAmount * Math.pow(1 + sipData.stepUpPercentage / 100, yearsPassed);
      }
      
      totalInvestment += currentAmount;
      futureValue = (futureValue + currentAmount) * (1 + expectedReturn);
      
      projectionData.push({
        month: `Month ${month}`,
        investment: totalInvestment,
        value: futureValue
      });
    }
    
    const estimatedReturns = futureValue - totalInvestment;
    
    // Calculate lumpsum comparison
    const lumpsumAmount = monthlyAmount * duration;
    const lumpsumValue = lumpsumAmount * Math.pow(1 + expectedReturn, duration);
    
    return {
      totalInvestment,
      futureValue,
      estimatedReturns,
      projectionData,
      lumpsumValue,
      lumpsumReturns: lumpsumValue - lumpsumAmount
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
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Set up SIP</h1>
          <p className="text-sm text-gray-500 mt-1">Systematic Investment Plan for {fund?.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SIP Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-green-600 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{fund?.name}</h2>
                  <p className="text-white/80 text-sm">{fund?.category}</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                    SIP Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="500"
                    max="100000"
                    step="500"
                    value={sipData.amount}
                    onChange={(e) => setSipData({ ...sipData, amount: parseInt(e.target.value) || 500 })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm ${
                      fieldError ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Min: ₹500 | Max: ₹1,00,000</p>
                  {fieldError && <p className="text-red-600 text-xs mt-1">{fieldError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                    Frequency
                  </label>
                  <select
                    value={sipData.frequency}
                    onChange={(e) => setSipData({ ...sipData, frequency: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={sipData.startDate}
                    onChange={(e) => setSipData({ ...sipData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                    Duration (months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={sipData.duration}
                    onChange={(e) => setSipData({ ...sipData, duration: parseInt(e.target.value) || 12 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max: 360 months (30 years)</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="stepUp"
                    checked={sipData.stepUp}
                    onChange={(e) => setSipData({ ...sipData, stepUp: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor="stepUp" className="text-sm font-medium text-gray-700">
                    Enable Step-up SIP
                  </label>
                </div>

                {sipData.stepUp && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                      Annual Step-up (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={sipData.stepUpPercentage}
                      onChange={(e) => setSipData({ ...sipData, stepUpPercentage: parseInt(e.target.value) || 10 })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                    />
                    <p className="text-sm text-gray-500 mt-1">Increase SIP amount annually by this %</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
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
                  <p className="text-2xl font-bold text-gray-900">₹{returns.totalInvestment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
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

            {/* Projection Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <LineChart className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Growth Projection</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={returns.projectionData.slice(0, Math.min(returns.projectionData.length, 24))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    tickFormatter={(value) => value.replace('Month ', '')}
                  />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value) => `₹${value.toFixed(0)}`}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="investment" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    name="Invested Amount"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stackId="2"
                    stroke="#10B981" 
                    fill="#10B981"
                    fillOpacity={0.3}
                    name="Portfolio Value"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Step-up Benefits */}
            {sipData.stepUp && (
              <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Step-up SIP Benefits</h4>
                    <p className="text-sm text-green-700">
                      By increasing your SIP by {sipData.stepUpPercentage}% annually, you could potentially earn 
                      <span className="font-bold"> significantly higher returns</span> over time due to the power of compounding on larger investments.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
