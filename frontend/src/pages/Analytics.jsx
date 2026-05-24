import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PieChart as PieChartIcon, TrendingUp, DollarSign, Calendar, Target, Activity, RefreshCw, Clock, Sparkles } from 'lucide-react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [portfolioRes, stocksRes, fundsRes, transactionsRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/portfolio/${user.id}`),
        axios.get('http://localhost:5001/api/stocks'),
        axios.get('http://localhost:5001/api/mutual-funds'),
        axios.get(`http://localhost:5001/api/transactions/${user.id}`)
      ]);
      setPortfolio(portfolioRes.data);
      setStocks(stocksRes.data);
      setMutualFunds(fundsRes.data);
      setTransactions(transactionsRes.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Calculate additional metrics
  const calculateMetrics = () => {
    if (!portfolio?.holdings?.length) return { totalInvested: 0, totalReturns: 0, bestPerformer: null, worstPerformer: null };
    
    const totalInvested = portfolio.holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
    const totalValue = portfolio.totalValue || 0;
    const totalReturns = totalValue - totalInvested;
    
    let bestPerformer = null;
    let worstPerformer = null;
    let bestReturn = -Infinity;
    let worstReturn = Infinity;
    
    portfolio.holdings.forEach(holding => {
      const currentValue = holding.quantity * holding.avgPrice;
      const returnPercent = ((currentValue - (holding.quantity * holding.avgPrice)) / (holding.quantity * holding.avgPrice)) * 100;
      
      if (returnPercent > bestReturn) {
        bestReturn = returnPercent;
        bestPerformer = holding;
      }
      if (returnPercent < worstReturn) {
        worstReturn = returnPercent;
        worstPerformer = holding;
      }
    });
    
    return { totalInvested, totalReturns, bestPerformer, worstPerformer };
  };

  const metrics = calculateMetrics();

  const getPortfolioAllocationData = () => {
    if (!portfolio?.holdings?.length) return [];
    
    return portfolio.holdings.map(holding => {
      const name = holding.type === 'stock' 
        ? stocks.find(s => s.id === holding.itemId)?.name 
        : mutualFunds.find(f => f.id === holding.itemId)?.name;
      const value = holding.quantity * holding.avgPrice;
      return {
        name: name || 'Unknown',
        value: value,
        type: holding.type
      };
    });
  };

  const getReturnsOverTimeData = () => {
    if (!transactions.length) return [];
    
    // Group transactions by date and calculate cumulative returns
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let cumulativeValue = 0;
    
    return sortedTransactions.slice(-10).map(transaction => {
      if (transaction.type === 'buy') {
        cumulativeValue -= transaction.total;
      } else {
        cumulativeValue += transaction.total;
      }
      return {
        date: new Date(transaction.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        value: Math.abs(cumulativeValue),
        type: transaction.type
      };
    });
  };

  const getAssetTypeDistribution = () => {
    if (!portfolio?.holdings?.length) return [];
    
    const stockValue = portfolio.holdings
      .filter(h => h.type === 'stock')
      .reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
    
    const mutualFundValue = portfolio.holdings
      .filter(h => h.type === 'mutual_fund')
      .reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
    
    return [
      { name: 'Stocks', value: stockValue },
      { name: 'Mutual Funds', value: mutualFundValue }
    ];
  };

  const getSectorDistribution = () => {
    if (!portfolio?.holdings?.length) return [];
    
    // Mock sector assignment based on stock/fund names
    const sectorMap = {
      'Technology': ['INFY', 'TCS'],
      'Banking': ['HDFCBANK', 'ICICIBANK', 'SBIN'],
      'Energy': ['RELIANCE', 'BHARTIARTL'],
      'Consumer': ['ITC'],
      'Large Cap': ['Axis Bluechip Fund', 'Mirae Asset Large Cap Fund'],
      'Small Cap': ['SBI Small Cap Fund'],
      'Mid Cap': ['HDFC Mid-Cap Opportunities', 'Kotak Emerging Equity']
    };
    
    const sectorAllocation = {};
    
    portfolio.holdings.forEach(holding => {
      const name = holding.type === 'stock' 
        ? stocks.find(s => s.id === holding.itemId)?.name 
        : mutualFunds.find(f => f.id === holding.itemId)?.name;
      const value = holding.quantity * holding.avgPrice;
      
      let sector = 'Other';
      for (const [sectorName, keywords] of Object.entries(sectorMap)) {
        if (keywords.some(keyword => name?.includes(keyword))) {
          sector = sectorName;
          break;
        }
      }
      
      sectorAllocation[sector] = (sectorAllocation[sector] || 0) + value;
    });
    
    return Object.entries(sectorAllocation)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const getPortfolioPerformanceData = () => {
    // Generate mock historical performance data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseValue = portfolio?.totalValue || 100000;
    
    return months.map((month, index) => {
      const randomChange = (Math.random() - 0.4) * 0.1;
      const value = baseValue * (1 + randomChange * (index + 1) / 12);
      return {
        month,
        value: Math.max(value, baseValue * 0.8),
        benchmark: baseValue * (1 + 0.05 * (index + 1) / 12)
      };
    });
  };

  const portfolioAllocation = getPortfolioAllocationData();
  const returnsOverTime = getReturnsOverTimeData();
  const assetTypeDistribution = getAssetTypeDistribution();
  const sectorDistribution = getSectorDistribution();
  const portfolioPerformance = getPortfolioPerformanceData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                Updated: {lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Investment Analytics</h1>
              <p className="text-gray-600 mt-2">Track your portfolio performance and allocation</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200">
              <Sparkles className="w-4 h-4" />
              Real-time insights
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100 font-medium">Total Portfolio Value</p>
                <p className="text-3xl font-bold mt-2">
                  ₹{portfolio?.totalValue?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Invested</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ₹{metrics.totalInvested.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <Target className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Returns</p>
                <p className={`text-3xl font-bold mt-2 ${metrics.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.totalReturns >= 0 ? '+' : ''}₹{Math.abs(metrics.totalReturns).toFixed(2)}
                </p>
              </div>
              <div className={`w-14 h-14 bg-gradient-to-br ${metrics.totalReturns >= 0 ? 'from-green-400 to-emerald-500' : 'from-red-400 to-red-500'} rounded-xl flex items-center justify-center shadow-lg ${metrics.totalReturns >= 0 ? 'shadow-green-500/20' : 'shadow-red-500/20'}`}>
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {transactions.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Activity className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Allocation Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Portfolio Allocation</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <PieChartIcon className="w-4 h-4" />
                Distribution
              </div>
            </div>
            {portfolioAllocation.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={portfolioAllocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <PieChartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No portfolio data available</p>
              </div>
            )}
          </div>

          {/* Asset Type Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Asset Type Distribution</h2>
            </div>
            {assetTypeDistribution.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={assetTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#00c853" />
                    <Cell fill="#1976d2" />
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="text-sm">No asset data available</p>
              </div>
            )}
          </div>

          {/* Sector Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Sector Distribution</h2>
            </div>
            {sectorDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sectorDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#6b7280" tick={{fontSize: 11}} />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" width={80} tick={{fontSize: 11}} />
                  <Tooltip 
                    formatter={(value) => `₹${value.toFixed(2)}`}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill="#7c4dff" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="text-sm">No sector data available</p>
              </div>
            )}
          </div>

          {/* Returns Over Time */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Recent Transaction Activity</h2>
            </div>
            {returnsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={returnsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{fontSize: 11}} />
                  <YAxis stroke="#6b7280" tick={{fontSize: 11}} />
                  <Tooltip 
                    formatter={(value) => `₹${value.toFixed(2)}`}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#00c853" name="Transaction Value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No transaction data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Performance Chart */}
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Portfolio Performance</h2>
          </div>
          {portfolioPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolioPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{fontSize: 11}} />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} tick={{fontSize: 11}} />
                <Tooltip 
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00c853" 
                  strokeWidth={2}
                  name="Portfolio Value"
                  dot={{ fill: '#00c853', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#1976d2" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Benchmark (NIFTY 50)"
                  dot={{ fill: '#1976d2', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-sm">No performance data available</p>
            </div>
          )}
        </div>

        {/* Holdings Breakdown Table */}
        <div className="mt-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Holdings Breakdown</h2>
            <div className="text-sm text-gray-500">{portfolio?.holdings?.length || 0} holdings</div>
          </div>
          {portfolio?.holdings?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {portfolio.holdings.map((holding, index) => {
                const name = holding.type === 'stock' 
                  ? stocks.find(s => s.id === holding.itemId)?.name 
                  : mutualFunds.find(f => f.id === holding.itemId)?.name;
                const value = holding.quantity * holding.avgPrice;
                const percentage = portfolio.totalValue > 0 ? (value / portfolio.totalValue * 100).toFixed(1) : 0;
                const dailyChange = (Math.random() - 0.5) * 5;
                
                return (
                  <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
                      >
                        <div 
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{name || 'Unknown'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded">
                            {holding.type.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            Qty: {holding.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">₹{value.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{percentage}% of portfolio</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-400">Today</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PieChartIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No holdings data</h3>
              <p className="text-gray-500">Start investing to see your holdings breakdown</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;
