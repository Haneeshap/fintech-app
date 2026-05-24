import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Calendar, TrendingUp, Plus, Trash2, CheckCircle, Clock, PieChart, Calculator, ArrowUpRight, Target } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dividends = () => {
  const { user } = useAuth();
  const [allDividends, setAllDividends] = useState([]);
  const [userDividends, setUserDividends] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [dividendsRes, userDividendsRes, stocksRes] = await Promise.all([
        axios.get('http://localhost:5001/api/dividends'),
        axios.get(`http://localhost:5001/api/dividends/${user.id}`),
        axios.get('http://localhost:5001/api/stocks')
      ]);
      setAllDividends(dividendsRes.data);
      setUserDividends(userDividendsRes.data);
      setStocks(stocksRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dividend data:', error);
      setLoading(false);
    }
  };

  const trackDividend = async (stockId) => {
    try {
      await axios.post(`http://localhost:5001/api/dividends/${user.id}/track`, { stockId });
      fetchData();
    } catch (error) {
      console.error('Error tracking dividend:', error);
    }
  };

  const untrackDividend = async (stockId) => {
    try {
      await axios.delete(`http://localhost:5001/api/dividends/${user.id}/untrack/${stockId}`);
      fetchData();
    } catch (error) {
      console.error('Error untracking dividend:', error);
    }
  };

  const isTracking = (stockId) => {
    return userDividends.some(d => d.stockId === stockId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'quarterly':
        return 'bg-green-100 text-green-800';
      case 'semi-annual':
        return 'bg-blue-100 text-blue-800';
      case 'annual':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateDividendYield = (dividend) => {
    const stock = stocks.find(s => s.id === dividend.stockId);
    if (!stock || !stock.price) return 0;
    const annualDividend = dividend.amount * getFrequencyMultiplier(dividend.frequency);
    return ((annualDividend / stock.price) * 100).toFixed(2);
  };

  const getFrequencyMultiplier = (frequency) => {
    switch (frequency) {
      case 'quarterly':
        return 4;
      case 'semi-annual':
        return 2;
      case 'annual':
        return 1;
      default:
        return 1;
    }
  };

  const calculateAnnualDividendIncome = () => {
    return userDividends.reduce((total, dividend) => {
      const annualAmount = dividend.amount * getFrequencyMultiplier(dividend.frequency);
      return total + annualAmount;
    }, 0);
  };

  const getDividendYieldData = () => {
    return userDividends.map(dividend => ({
      name: dividend.stockSymbol,
      yield: parseFloat(calculateDividendYield(dividend)),
      amount: dividend.amount * getFrequencyMultiplier(dividend.frequency)
    })).sort((a, b) => b.yield - a.yield);
  };

  const getMonthlyDividendProjection = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => {
      const monthlyIncome = userDividends.reduce((total, dividend) => {
        const payoutMonth = new Date(dividend.payoutDate).toLocaleString('en-IN', { month: 'short' });
        if (payoutMonth === month) {
          return total + dividend.amount;
        }
        return total;
      }, 0);
      return { month, income: monthlyIncome };
    });
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dividend data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dividend Tracker</h1>
          <p className="text-gray-600">Track dividend payouts and upcoming ex-dividend dates</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tracking</p>
                <p className="text-2xl font-bold text-gray-900">{userDividends.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming Payouts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userDividends.filter(d => getDaysUntil(d.payoutDate) > 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calculator className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Annual Income</p>
                <p className="text-2xl font-bold text-gray-900">₹{calculateAnnualDividendIncome().toFixed(0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Yield</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userDividends.length > 0 
                    ? (getDividendYieldData().reduce((sum, d) => sum + d.yield, 0) / userDividends.length).toFixed(2) 
                    : '0'}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dividend Analytics */}
        {userDividends.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Dividend Yield Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Dividend Yield Distribution</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={getDividendYieldData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, yield: yieldVal }) => `${name}: ${yieldVal}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="yield"
                  >
                    {getDividendYieldData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Projection */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Monthly Dividend Projection</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getMonthlyDividendProjection()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${value}`} />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Your Tracked Dividends */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Tracked Dividends</h2>
          {userDividends.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">You're not tracking any dividends yet. Start tracking to stay informed!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userDividends.map((dividend) => {
                const daysUntil = getDaysUntil(dividend.payoutDate);
                const isPaid = daysUntil < 0;
                return (
                  <div key={dividend.id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{dividend.stockSymbol}</h3>
                        <p className="text-sm text-gray-600">{dividend.stockName}</p>
                      </div>
                      <button
                        onClick={() => untrackDividend(dividend.stockId)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Amount</span>
                        <span className="text-lg font-bold text-green-600">₹{dividend.amount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Yield</span>
                        <span className="text-sm font-bold text-blue-600">{calculateDividendYield(dividend)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Frequency</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getFrequencyColor(dividend.frequency)}`}>
                          {dividend.frequency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payout Date</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(dividend.payoutDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        {isPaid ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-blue-600" />
                        )}
                        <span className={`text-sm font-medium ${isPaid ? 'text-green-600' : 'text-blue-600'}`}>
                          {isPaid ? 'Paid' : `${daysUntil} days remaining`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Dividends */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Dividends</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allDividends.map((dividend) => {
              const tracking = isTracking(dividend.stockId);
              return (
                <div
                  key={dividend.id}
                  className={`bg-white rounded-xl shadow-md p-6 ${tracking ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{dividend.stockSymbol}</h3>
                      <p className="text-sm text-gray-600">{dividend.stockName}</p>
                    </div>
                    {!tracking && (
                      <button
                        onClick={() => trackDividend(dividend.stockId)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className="text-lg font-bold text-green-600">₹{dividend.amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Frequency</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getFrequencyColor(dividend.frequency)}`}>
                        {dividend.frequency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ex-Date</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(dividend.exDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Payout Date</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(dividend.payoutDate)}</span>
                    </div>
                  </div>
                  {tracking && (
                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-2 text-blue-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Tracking</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dividends;
