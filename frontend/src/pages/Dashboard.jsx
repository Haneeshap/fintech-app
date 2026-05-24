import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Wallet, PieChart, ArrowUpRight, ArrowDownRight, Search, Star, LogOut, Home, BarChart3, Heart, History, LineChart, User, Calendar, Newspaper, Activity, GitCompare, Bell, SlidersHorizontal, DollarSign, Target, Shield, Clock, Sparkles, RefreshCw, Calculator as CalculatorIcon, Scale, Percent, Smile, Layers, Award, BookOpen, Zap, FileText, Shield as ShieldIcon } from 'lucide-react';
import axios from 'axios';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [marketStatus, setMarketStatus] = useState('open');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [marketNews, setMarketNews] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [portfolioRes, stocksRes, fundsRes, watchlistRes, transactionsRes, newsRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/portfolio/${user.id}`),
        axios.get('http://localhost:5001/api/stocks'),
        axios.get('http://localhost:5001/api/mutual-funds'),
        axios.get(`http://localhost:5001/api/watchlist/${user.id}`),
        axios.get(`http://localhost:5001/api/transactions/${user.id}`),
        axios.get('http://localhost:5001/api/news')
      ]);
      setPortfolio(portfolioRes.data);
      setStocks(stocksRes.data);
      setMutualFunds(fundsRes.data);
      setWatchlist(watchlistRes.data.items || []);
      setRecentTransactions(transactionsRes.data.slice(0, 5));
      setMarketNews(newsRes.data.slice(0, 3));
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

  // Calculate portfolio P&L
  const calculatePortfolioPnL = () => {
    if (!portfolio?.holdings?.length) return { value: 0, percentage: 0 };
    const currentValue = portfolio.totalValue || 0;
    const investedValue = portfolio.holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
    const pnl = currentValue - investedValue;
    const pnlPercentage = investedValue > 0 ? ((pnl / investedValue) * 100) : 0;
    return { value: pnl, percentage: pnlPercentage };
  };

  const portfolioPnL = calculatePortfolioPnL();

  // Calculate portfolio allocation
  const calculatePortfolioAllocation = () => {
    if (!portfolio?.holdings?.length) return [];
    
    const allocation = portfolio.holdings.reduce((acc, holding) => {
      const value = holding.quantity * holding.avgPrice;
      const type = holding.type === 'stock' ? 'Stocks' : 'Mutual Funds';
      acc[type] = (acc[type] || 0) + value;
      return acc;
    }, {});

    return Object.entries(allocation).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / portfolio.totalValue) * 100).toFixed(1)
    }));
  };

  const portfolioAllocation = calculatePortfolioAllocation();
  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const addToWatchlist = async (type, itemId) => {
    try {
      await axios.post(`http://localhost:5001/api/watchlist/${user.id}/add`, { type, itemId });
      fetchData();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5001/api/watchlist/${user.id}/remove/${itemId}`);
      fetchData();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFunds = mutualFunds.filter(fund =>
    fund.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">InvestHub</span>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded ${marketStatus === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {marketStatus === 'open' ? 'Market Open' : 'Market Closed'}
                </span>
                <span className="text-xs text-gray-500">
                  {lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition text-sm"
              >
                <User className="w-4 h-4" />
                {user?.name}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Professional Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 ${
                activeTab === 'overview' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Home className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('stocks')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 ${
                activeTab === 'stocks' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Stocks
            </button>
            <button
              onClick={() => setActiveTab('mutual-funds')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 ${
                activeTab === 'mutual-funds' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Mutual Funds
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 ${
                activeTab === 'watchlist' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Heart className="w-4 h-4" />
              Watchlist
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <LineChart className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => navigate('/compare')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <GitCompare className="w-4 h-4" />
              Compare
            </button>
            <button
              onClick={() => navigate('/alerts')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <Bell className="w-4 h-4" />
              Alerts
            </button>
            <button
              onClick={() => navigate('/goals')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <Target className="w-4 h-4" />
              Goals
            </button>
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <History className="w-4 h-4" />
              Transactions
            </button>
            <button
              onClick={() => navigate('/news')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <Newspaper className="w-4 h-4" />
              News
            </button>
            <button
              onClick={() => navigate('/indices')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <Activity className="w-4 h-4" />
              Indices
            </button>
            <button
              onClick={() => navigate('/screener')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Screener
            </button>
            <button
              onClick={() => navigate('/dividends')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <DollarSign className="w-4 h-4" />
              Dividends
            </button>
            <button
              onClick={() => navigate('/risk-assessment')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <Shield className="w-4 h-4" />
              Risk Profile
            </button>
            <button
              onClick={() => navigate('/calculator')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <CalculatorIcon className="w-4 h-4" />
              Calculator
            </button>
            <button
              onClick={() => navigate('/rebalancing')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <Scale className="w-4 h-4" />
              Rebalancing
            </button>
            <button
              onClick={() => navigate('/market-sentiment')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <Smile className="w-4 h-4" />
              Market Sentiment
            </button>
            <button
              onClick={() => navigate('/sip')}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition border-b-2 border-transparent"
            >
              <Zap className="w-4 h-4" />
              SIP
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Portfolio Value</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ₹{portfolio?.totalValue?.toLocaleString('en-IN') || '0'}
                    </p>
                    <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${portfolioPnL.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolioPnL.value >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {portfolioPnL.value >= 0 ? '+' : ''}₹{Math.abs(portfolioPnL.value).toFixed(2)} ({portfolioPnL.percentage >= 0 ? '+' : ''}{portfolioPnL.percentage.toFixed(2)}%)
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Holdings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {portfolio?.holdings?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Active investments</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Watchlist</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {watchlist.length}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Tracking assets</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Day's P&L</p>
                    <p className={`text-2xl font-bold mt-1 ${portfolioPnL.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolioPnL.value >= 0 ? '+' : ''}₹{Math.abs(portfolioPnL.value).toFixed(2)}
                    </p>
                    <p className={`text-sm mt-2 ${portfolioPnL.percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolioPnL.percentage >= 0 ? '+' : ''}{portfolioPnL.percentage.toFixed(2)}%
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${portfolioPnL.value >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {portfolioPnL.value >= 0 ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingUp className="w-5 h-5 text-red-600" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('stocks')}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200"
                >
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Buy Stocks</span>
                </button>
                <button
                  onClick={() => setActiveTab('mutual-funds')}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Buy Funds</span>
                </button>
                <button
                  onClick={() => navigate('/transactions')}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200"
                >
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <History className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">History</span>
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200"
                >
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Analytics</span>
                </button>
              </div>
            </div>

            {/* Portfolio Allocation */}
            {portfolioAllocation.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Portfolio Allocation</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={portfolioAllocation}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {portfolioAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {portfolioAllocation.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{item.value.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{item.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Holdings */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Your Holdings</h2>
                <button
                  onClick={() => navigate('/analytics')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Analytics
                </button>
              </div>
              {portfolio?.holdings?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {portfolio.holdings.map((holding, index) => {
                    const name = holding.type === 'stock' 
                      ? stocks.find(s => s.id === holding.itemId)?.name 
                      : mutualFunds.find(f => f.id === holding.itemId)?.name;
                    const currentValue = holding.quantity * holding.avgPrice;
                    const dailyChange = (Math.random() - 0.5) * 10;
                    const dailyChangePercent = (dailyChange / currentValue) * 100;
                    
                    return (
                      <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${holding.type === 'stock' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                            {holding.type === 'stock' ? <BarChart3 className="w-5 h-5 text-blue-600" /> : <PieChart className="w-5 h-5 text-purple-600" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{name || 'Unknown'}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded">
                                {holding.type.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-gray-500">
                                Qty: {holding.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              ₹{currentValue.toFixed(2)}
                            </p>
                            <p className={`text-xs font-medium ${dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {dailyChange >= 0 ? '+' : ''}{dailyChangePercent.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">No holdings yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Start building your investment portfolio today</p>
                  <button
                    onClick={() => setActiveTab('stocks')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    Start Investing
                  </button>
                </div>
              )}
            </div>

            {/* Recent Transactions & Market News */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Transactions */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Recent Transactions</h2>
                  <button
                    onClick={() => navigate('/transactions')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                {recentTransactions.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-3 hover:bg-gray-50 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              transaction.type === 'buy' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {transaction.type === 'buy' ? (
                                <ArrowUpRight className="w-4 h-4 text-green-600" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{transaction.itemName}</p>
                              <p className="text-xs text-gray-500">{transaction.type.toUpperCase()} • {transaction.quantity} shares</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${transaction.type === 'buy' ? 'text-red-600' : 'text-green-600'}`}>
                              {transaction.type === 'buy' ? '-' : '+'}₹{transaction.total.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No recent transactions</p>
                  </div>
                )}
              </div>

              {/* Market News */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Market News</h2>
                  <button
                    onClick={() => navigate('/news')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                {marketNews.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {marketNews.map((news) => (
                      <div key={news.id} className="p-3 hover:bg-gray-50 transition cursor-pointer">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Newspaper className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 leading-tight mb-1">{news.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{news.category}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(news.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <Newspaper className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No news available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stocks' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stocks by name or symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4" />
                {filteredStocks.length} stocks available
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {filteredStocks.map((stock) => (
                  <div key={stock.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                        <span className="text-white font-bold text-sm">{stock.symbol?.substring(0, 2)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{stock.name}</p>
                        <p className="text-sm text-gray-500">{stock.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">₹{stock.price.toFixed(2)}</p>
                      <div className={`flex items-center justify-end gap-1 text-sm font-medium ${
                        stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stock.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </div>
                    </div>
                    <div className="ml-6 flex gap-2">
                      <button
                        onClick={() => addToWatchlist('stock', stock.id)}
                        className="p-2.5 hover:bg-gray-100 rounded-xl transition group/btn"
                        title="Add to watchlist"
                      >
                        <Star className="w-5 h-5 text-gray-400 group-hover/btn:text-yellow-500 transition" />
                      </button>
                      <button
                        onClick={() => navigate(`/buy/stock/${stock.id}`)}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-md shadow-blue-500/20 font-medium"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mutual-funds' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mutual funds by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4" />
                {filteredFunds.length} funds available
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {filteredFunds.map((fund) => (
                  <div key={fund.id} className="p-6 hover:bg-gray-50 transition group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20">
                          <PieChart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{fund.name}</p>
                          <p className="text-sm text-gray-500">{fund.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">NAV: ₹{fund.nav}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <p className="text-sm text-gray-600 font-medium">1Y Returns</p>
                        <p className="font-bold text-green-600 text-lg mt-1">{fund.returns['1Y']}%</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <p className="text-sm text-gray-600 font-medium">3Y Returns</p>
                        <p className="font-bold text-green-600 text-lg mt-1">{fund.returns['3Y']}%</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <p className="text-sm text-gray-600 font-medium">5Y Returns</p>
                        <p className="font-bold text-green-600 text-lg mt-1">{fund.returns['5Y']}%</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToWatchlist('mutual_fund', fund.id)}
                        className="p-2.5 hover:bg-gray-100 rounded-xl transition group/btn"
                        title="Add to watchlist"
                      >
                        <Star className="w-5 h-5 text-gray-400 group-hover/btn:text-yellow-500 transition" />
                      </button>
                      <button
                        onClick={() => navigate(`/buy/mutual-fund/${fund.id}`)}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-md shadow-blue-500/20 font-medium"
                      >
                        Invest
                      </button>
                      <button
                        onClick={() => navigate(`/sip/${fund.id}`)}
                        className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition shadow-md shadow-green-500/20 font-medium flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Start SIP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Your Watchlist</h2>
              </div>
              {watchlist.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {watchlist.map((item) => {
                    const data = item.type === 'stock'
                      ? stocks.find(s => s.id === item.itemId)
                      : mutualFunds.find(f => f.id === item.itemId);
                    if (!data) return null;
                    return (
                      <div key={item.itemId} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                        <div>
                          <p className="font-semibold text-gray-900">{data.name}</p>
                          <p className="text-sm text-gray-600">{data.symbol || data.category}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => removeFromWatchlist(item.itemId)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition text-red-500"
                            title="Remove from watchlist"
                          >
                            <Star className="w-5 h-5 fill-current" />
                          </button>
                          <button
                            onClick={() => navigate(`/buy/${item.type}/${item.itemId}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            {item.type === 'stock' ? 'Buy' : 'Invest'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Your watchlist is empty. Add stocks and funds to track!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
