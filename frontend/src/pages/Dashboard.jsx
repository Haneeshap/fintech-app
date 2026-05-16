import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Wallet, PieChart, ArrowUpRight, ArrowDownRight, Search, Star, LogOut, Home, BarChart3, Heart, History, LineChart, User, Calendar } from 'lucide-react';
import axios from 'axios';

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

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [portfolioRes, stocksRes, fundsRes, watchlistRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/portfolio/${user.id}`),
        axios.get('http://localhost:5000/api/stocks'),
        axios.get('http://localhost:5000/api/mutual-funds'),
        axios.get(`http://localhost:5000/api/watchlist/${user.id}`)
      ]);
      setPortfolio(portfolioRes.data);
      setStocks(stocksRes.data);
      setMutualFunds(fundsRes.data);
      setWatchlist(watchlistRes.data.items || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const addToWatchlist = async (type, itemId) => {
    try {
      await axios.post(`http://localhost:5000/api/watchlist/${user.id}/add`, { type, itemId });
      fetchData();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/api/watchlist/${user.id}/remove/${itemId}`);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">InvestHub</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <User className="w-5 h-5" />
                {user?.name}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition ${
                activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Home className="w-5 h-5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('stocks')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition ${
                activeTab === 'stocks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Stocks
            </button>
            <button
              onClick={() => setActiveTab('mutual-funds')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition ${
                activeTab === 'mutual-funds' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <PieChart className="w-5 h-5" />
              Mutual Funds
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition ${
                activeTab === 'watchlist' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="w-5 h-5" />
              Watchlist
            </button>
            <button
              onClick={() => navigate('/transactions')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition ${
                activeTab === 'transactions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-5 h-5" />
              Transactions
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition ${
                activeTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <LineChart className="w-5 h-5" />
              Analytics
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Portfolio Value</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      ₹{portfolio?.totalValue?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Holdings</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {portfolio?.holdings?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Watchlist Items</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {watchlist.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Holdings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Your Holdings</h2>
              </div>
              {portfolio?.holdings?.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {portfolio.holdings.map((holding, index) => (
                    <div key={index} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {holding.type === 'stock' 
                            ? stocks.find(s => s.id === holding.itemId)?.name 
                            : mutualFunds.find(f => f.id === holding.itemId)?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {holding.quantity} | Avg: ₹{holding.avgPrice?.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{(holding.quantity * holding.avgPrice).toFixed(2)}
                          </p>
                          <p className="text-sm text-green-600 flex items-center justify-end gap-1">
                            <ArrowUpRight className="w-4 h-4" />
                            +2.5%
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/sell/${holding.itemId}`)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No holdings yet. Start investing!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stocks' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {filteredStocks.map((stock) => (
                  <div key={stock.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{stock.name}</p>
                      <p className="text-sm text-gray-600">{stock.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{stock.price.toFixed(2)}</p>
                      <p className={`text-sm flex items-center justify-end gap-1 ${
                        stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stock.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </p>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => addToWatchlist('stock', stock.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Add to watchlist"
                      >
                        <Star className="w-5 h-5 text-gray-400 hover:text-yellow-500" />
                      </button>
                      <button
                        onClick={() => navigate(`/buy/stock/${stock.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mutual funds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {filteredFunds.map((fund) => (
                  <div key={fund.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">{fund.name}</p>
                        <p className="text-sm text-gray-600">{fund.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">NAV: ₹{fund.nav}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">1Y Returns</p>
                        <p className="font-semibold text-green-600">{fund.returns['1Y']}%</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">3Y Returns</p>
                        <p className="font-semibold text-green-600">{fund.returns['3Y']}%</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">5Y Returns</p>
                        <p className="font-semibold text-green-600">{fund.returns['5Y']}%</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToWatchlist('mutual_fund', fund.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Add to watchlist"
                      >
                        <Star className="w-5 h-5 text-gray-400 hover:text-yellow-500" />
                      </button>
                      <button
                        onClick={() => navigate(`/buy/mutual-fund/${fund.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Invest
                      </button>
                      <button
                        onClick={() => navigate(`/sip/${fund.id}`)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        SIP
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
