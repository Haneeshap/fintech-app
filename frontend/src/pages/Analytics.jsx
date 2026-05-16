import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PieChart as PieChartIcon, TrendingUp, DollarSign } from 'lucide-react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
  const [transactions, setTransactions] = useState([]);
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
      const [portfolioRes, stocksRes, fundsRes, transactionsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/portfolio/${user.id}`),
        axios.get('http://localhost:5000/api/stocks'),
        axios.get('http://localhost:5000/api/mutual-funds'),
        axios.get(`http://localhost:5000/api/transactions/${user.id}`)
      ]);
      setPortfolio(portfolioRes.data);
      setStocks(stocksRes.data);
      setMutualFunds(fundsRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const portfolioAllocation = getPortfolioAllocationData();
  const returnsOverTime = getReturnsOverTimeData();
  const assetTypeDistribution = getAssetTypeDistribution();

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Investment Analytics</h1>
          <p className="text-gray-600 mt-2">Track your portfolio performance and allocation</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ₹{portfolio?.totalValue?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Investments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {transactions.filter(t => t.type === 'buy').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Holdings</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {portfolio?.holdings?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <PieChartIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Allocation Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Portfolio Allocation</h2>
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
                No portfolio data available
              </div>
            )}
          </div>

          {/* Asset Type Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Asset Type Distribution</h2>
            {assetTypeDistribution.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assetTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#10B981" />
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No asset data available
              </div>
            )}
          </div>

          {/* Returns Over Time */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Transaction Activity</h2>
            {returnsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={returnsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" name="Transaction Value" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No transaction data available
              </div>
            )}
          </div>
        </div>

        {/* Holdings Breakdown Table */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Holdings Breakdown</h2>
          </div>
          {portfolio?.holdings?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {portfolio.holdings.map((holding, index) => {
                const name = holding.type === 'stock' 
                  ? stocks.find(s => s.id === holding.itemId)?.name 
                  : mutualFunds.find(f => f.id === holding.itemId)?.name;
                const value = holding.quantity * holding.avgPrice;
                const percentage = portfolio.totalValue > 0 ? (value / portfolio.totalValue * 100).toFixed(1) : 0;
                
                return (
                  <div key={index} className="p-6 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600 capitalize">{holding.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{value.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{percentage}% of portfolio</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              No holdings data available
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;
