import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Target, TrendingUp, AlertTriangle, CheckCircle, PieChart as PieChartIcon, BarChart3, Calculator, DollarSign, Zap, Clock } from 'lucide-react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const Rebalancing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetAllocation, setTargetAllocation] = useState({
    stocks: 60,
    mutualFunds: 40
  });
  const [rebalanceSuggestions, setRebalanceSuggestions] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [portfolioRes, stocksRes, fundsRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/portfolio/${user.id}`),
        axios.get('http://localhost:5001/api/stocks'),
        axios.get('http://localhost:5001/api/mutual-funds')
      ]);
      setPortfolio(portfolioRes.data);
      setStocks(stocksRes.data);
      setMutualFunds(fundsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentAllocation = () => {
    if (!portfolio?.holdings?.length) return { stocks: 0, mutualFunds: 0 };
    
    const stockValue = portfolio.holdings
      .filter(h => h.type === 'stock')
      .reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
    
    const fundValue = portfolio.holdings
      .filter(h => h.type === 'mutual_fund')
      .reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
    
    const total = stockValue + fundValue;
    
    return {
      stocks: total > 0 ? (stockValue / total) * 100 : 0,
      mutualFunds: total > 0 ? (fundValue / total) * 100 : 0
    };
  };

  const calculateRebalanceSuggestions = () => {
    const current = calculateCurrentAllocation();
    const totalValue = portfolio?.totalValue || 0;
    
    const suggestions = [];
    
    // Calculate target values
    const targetStockValue = (targetAllocation.stocks / 100) * totalValue;
    const targetFundValue = (targetAllocation.mutualFunds / 100) * totalValue;
    
    // Calculate current values
    const currentStockValue = portfolio.holdings
      .filter(h => h.type === 'stock')
      .reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
    
    const currentFundValue = portfolio.holdings
      .filter(h => h.type === 'mutual_fund')
      .reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
    
    // Determine what needs to be rebalanced
    const stockDiff = targetStockValue - currentStockValue;
    const fundDiff = targetFundValue - currentFundValue;
    
    if (Math.abs(stockDiff) > totalValue * 0.05) {
      suggestions.push({
        type: stockDiff > 0 ? 'buy' : 'sell',
        assetType: 'stock',
        amount: Math.abs(stockDiff),
        percentage: Math.abs((stockDiff / totalValue) * 100).toFixed(1)
      });
    }
    
    if (Math.abs(fundDiff) > totalValue * 0.05) {
      suggestions.push({
        type: fundDiff > 0 ? 'buy' : 'sell',
        assetType: 'mutual_fund',
        amount: Math.abs(fundDiff),
        percentage: Math.abs((fundDiff / totalValue) * 100).toFixed(1)
      });
    }
    
    return suggestions;
  };

  const calculateDetailedRebalancing = () => {
    if (!portfolio?.holdings?.length) return [];
    
    const totalValue = portfolio?.totalValue || 0;
    const detailedSuggestions = [];
    
    portfolio.holdings.forEach(holding => {
      const currentValue = holding.quantity * holding.avgPrice;
      const currentPercentage = (currentValue / totalValue) * 100;
      const targetPercentage = holding.type === 'stock' 
        ? targetAllocation.stocks / portfolio.holdings.filter(h => h.type === 'stock').length
        : targetAllocation.mutualFunds / portfolio.holdings.filter(h => h.type === 'mutual_fund').length;
      
      const diff = targetPercentage - currentPercentage;
      const diffValue = (diff / 100) * totalValue;
      
      if (Math.abs(diff) > 2) {
        const itemName = holding.type === 'stock'
          ? stocks.find(s => s.id === holding.itemId)?.name
          : mutualFunds.find(f => f.id === holding.itemId)?.name;
        
        detailedSuggestions.push({
          itemId: holding.itemId,
          itemName: itemName || 'Unknown',
          type: holding.type,
          currentValue,
          currentPercentage,
          targetPercentage,
          diff,
          diffValue,
          action: diff > 0 ? 'buy' : 'sell',
          taxImpact: diff < 0 ? Math.abs(diffValue) * 0.15 : 0, // 15% tax on gains
          transactionCost: Math.abs(diffValue) * 0.01 // 1% transaction cost
        });
      }
    });
    
    return detailedSuggestions.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  };

  const calculateRebalancingImpact = () => {
    const detailed = calculateDetailedRebalancing();
    const totalTax = detailed.reduce((sum, item) => sum + item.taxImpact, 0);
    const totalTransactionCost = detailed.reduce((sum, item) => sum + item.transactionCost, 0);
    const totalCost = totalTax + totalTransactionCost;
    
    return {
      totalTax,
      totalTransactionCost,
      totalCost,
      netImpact: detailed.reduce((sum, item) => sum + item.diffValue, 0) - totalCost
    };
  };

  const getHistoricalRebalancingData = () => {
    // Mock historical rebalancing performance
    return [
      { date: 'Jan', before: 68, after: 72, improvement: 4 },
      { date: 'Feb', before: 71, after: 74, improvement: 3 },
      { date: 'Mar', before: 69, after: 73, improvement: 4 },
      { date: 'Apr', before: 70, after: 75, improvement: 5 },
      { date: 'May', before: 72, after: 76, improvement: 4 },
    ];
  };

  const currentAllocation = calculateCurrentAllocation();
  const suggestions = calculateRebalanceSuggestions();
  const detailedSuggestions = calculateDetailedRebalancing();
  const rebalancingImpact = calculateRebalancingImpact();
  const historicalData = getHistoricalRebalancingData();

  const allocationData = [
    { name: 'Stocks', current: currentAllocation.stocks, target: targetAllocation.stocks },
    { name: 'Mutual Funds', current: currentAllocation.mutualFunds, target: targetAllocation.mutualFunds }
  ];

  const pieData = [
    { name: 'Stocks', value: currentAllocation.stocks },
    { name: 'Mutual Funds', value: currentAllocation.mutualFunds }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rebalancing tool...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Portfolio Rebalancing</h1>
          <p className="text-sm text-gray-500 mt-1">Optimize your portfolio allocation to match your investment strategy</p>
        </div>

        {!portfolio?.holdings?.length ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No holdings to rebalance</h3>
            <p className="text-gray-500 mb-6">Start investing to use the rebalancing tool</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-500/30"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Target Allocation Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Target Allocation</h2>
                  <p className="text-sm text-gray-500">Set your desired portfolio allocation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Allocation: {targetAllocation.stocks}%
                  </label>
                  <input
                    type="range"
                    value={targetAllocation.stocks}
                    onChange={(e) => setTargetAllocation({ ...targetAllocation, stocks: Number(e.target.value), mutualFunds: 100 - Number(e.target.value) })}
                    min="0"
                    max="100"
                    step="5"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mutual Fund Allocation: {targetAllocation.mutualFunds}%
                  </label>
                  <input
                    type="range"
                    value={targetAllocation.mutualFunds}
                    onChange={(e) => setTargetAllocation({ ...targetAllocation, mutualFunds: Number(e.target.value), stocks: 100 - Number(e.target.value) })}
                    min="0"
                    max="100"
                    step="5"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Current vs Target Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <PieChartIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Current Allocation</h2>
                    <p className="text-sm text-gray-500">Your current portfolio distribution</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
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
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Allocation Comparison</h2>
                    <p className="text-sm text-gray-500">Current vs Target</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={allocationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => `${value.toFixed(1)}%`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="current" fill="#3B82F6" name="Current %" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="target" fill="#10B981" name="Target %" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rebalancing Suggestions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Rebalancing Suggestions</h2>
                  <p className="text-sm text-gray-500">Recommended actions to achieve target allocation</p>
                </div>
              </div>

              {suggestions.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center gap-4">
                  <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900">Portfolio is balanced</h3>
                    <p className="text-sm text-green-700">Your current allocation matches your target allocation within 5% tolerance.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className={`border rounded-xl p-6 flex items-center justify-between ${
                      suggestion.type === 'buy' 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          suggestion.type === 'buy' ? 'bg-blue-100' : 'bg-red-100'
                        }`}>
                          {suggestion.type === 'buy' ? (
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${
                            suggestion.type === 'buy' ? 'text-blue-900' : 'text-red-900'
                          }`}>
                            {suggestion.type === 'buy' ? 'Buy' : 'Sell'} {suggestion.assetType.replace('_', ' ')}
                          </h3>
                          <p className={`text-sm ${
                            suggestion.type === 'buy' ? 'text-blue-700' : 'text-red-700'
                          }`}>
                            {suggestion.type === 'buy' ? 'Increase' : 'Decrease'} allocation by ₹{suggestion.amount.toFixed(2).toLocaleString('en-IN')} ({suggestion.percentage}%)
                          </p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-lg font-medium ${
                        suggestion.type === 'buy' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {suggestion.type === 'buy' ? '+' : '-'}₹{suggestion.amount.toFixed(2).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed Rebalancing Suggestions */}
            {detailedSuggestions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Detailed Rebalancing Plan</h2>
                    <p className="text-sm text-gray-500">Holding-level rebalancing recommendations</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {detailedSuggestions.map((item, index) => (
                    <div key={index} className={`border rounded-xl p-5 ${
                      item.action === 'buy' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.itemName}</h3>
                          <p className="text-sm text-gray-600 capitalize">{item.type.replace('_', ' ')}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg font-medium text-sm ${
                          item.action === 'buy' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.action === 'buy' ? 'BUY' : 'SELL'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Current</p>
                          <p className="font-semibold text-gray-900">{item.currentPercentage.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Target</p>
                          <p className="font-semibold text-gray-900">{item.targetPercentage.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Adjustment</p>
                          <p className={`font-semibold ${item.diff > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {item.diff > 0 ? '+' : ''}{item.diff.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Value</p>
                          <p className="font-semibold text-gray-900">₹{item.diffValue.toFixed(0).toLocaleString()}</p>
                        </div>
                      </div>
                      {item.taxImpact > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                          <p className="text-gray-600">Estimated Tax Impact: <span className="font-semibold text-red-600">₹{item.taxImpact.toFixed(0).toLocaleString()}</span></p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Impact Analysis */}
            {detailedSuggestions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Cost Impact Analysis</h2>
                    <p className="text-sm text-gray-500">Estimated costs of rebalancing</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-xl p-5">
                    <p className="text-sm text-gray-600 mb-2">Tax Impact</p>
                    <p className="text-2xl font-bold text-red-600">₹{rebalancingImpact.totalTax.toFixed(0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Capital gains tax</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5">
                    <p className="text-sm text-gray-600 mb-2">Transaction Costs</p>
                    <p className="text-2xl font-bold text-orange-600">₹{rebalancingImpact.totalTransactionCost.toFixed(0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Brokerage & fees</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5">
                    <p className="text-sm text-gray-600 mb-2">Total Cost</p>
                    <p className="text-2xl font-bold text-gray-900">₹{rebalancingImpact.totalCost.toFixed(0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">All costs combined</p>
                  </div>
                </div>
              </div>
            )}

            {/* Historical Rebalancing Performance */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Historical Rebalancing Performance</h2>
                  <p className="text-sm text-gray-500">Portfolio score improvement after rebalancing</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" domain={[60, 80]} />
                  <Tooltip 
                    formatter={(value) => value}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="before" stroke="#EF4444" strokeWidth={2} name="Before Rebalancing" dot={{ fill: '#EF4444' }} />
                  <Line type="monotone" dataKey="after" stroke="#10B981" strokeWidth={2} name="After Rebalancing" dot={{ fill: '#10B981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-500/30 font-medium"
              >
                View Analytics
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Rebalancing;
