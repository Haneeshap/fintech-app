import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, TrendingDown, TrendingUp, DollarSign, Percent, Info, FileText } from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const TaxCalculator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taxRate, setTaxRate] = useState(15);
  const [holdingPeriod, setHoldingPeriod] = useState(1);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [portfolioRes, stocksRes, transactionsRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/portfolio/${user.id}`),
        axios.get('http://localhost:5001/api/stocks'),
        axios.get(`http://localhost:5001/api/transactions/${user.id}`)
      ]);
      setPortfolio(portfolioRes.data);
      setStocks(stocksRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTaxLoss = () => {
    if (!portfolio?.holdings?.length || !transactions.length) {
      return {
        totalGain: 0,
        totalLoss: 0,
        netGain: 0,
        taxableGain: 0,
        taxAmount: 0,
        afterTaxReturn: 0,
        holdings: []
      };
    }

    let totalGain = 0;
    let totalLoss = 0;
    const holdingsAnalysis = [];

    portfolio.holdings.forEach(holding => {
      const name = holding.type === 'stock' 
        ? stocks.find(s => s.id === holding.itemId)?.name 
        : 'Mutual Fund';
      
      const currentValue = holding.quantity * holding.avgPrice;
      const purchaseValue = holding.quantity * holding.avgPrice;
      
      // Simulate current market price (in real app, this would come from API)
      const currentPrice = holding.avgPrice * (1 + (Math.random() - 0.5) * 0.3);
      const currentMarketValue = holding.quantity * currentPrice;
      
      const unrealizedGain = currentMarketValue - purchaseValue;
      const unrealizedGainPercent = purchaseValue > 0 ? (unrealizedGain / purchaseValue) * 100 : 0;

      if (unrealizedGain > 0) {
        totalGain += unrealizedGain;
      } else {
        totalLoss += Math.abs(unrealizedGain);
      }

      holdingsAnalysis.push({
        name,
        type: holding.type,
        purchaseValue,
        currentMarketValue,
        unrealizedGain,
        unrealizedGainPercent,
        quantity: holding.quantity
      });
    });

    const netGain = totalGain - totalLoss;
    const taxableGain = Math.max(0, netGain);
    const taxAmount = taxableGain * (taxRate / 100);
    const afterTaxReturn = netGain - taxAmount;

    return {
      totalGain,
      totalLoss,
      netGain,
      taxableGain,
      taxAmount,
      afterTaxReturn,
      holdings: holdingsAnalysis
    };
  };

  const taxData = calculateTaxLoss();

  const gainLossData = [
    { name: 'Realized Gains', value: taxData.totalGain },
    { name: 'Realized Losses', value: taxData.totalLoss },
    { name: 'Net Position', value: taxData.netGain }
  ];

  const taxBreakdownData = [
    { name: 'Taxable Gain', value: taxData.taxableGain },
    { name: 'Tax Amount', value: taxData.taxAmount },
    { name: 'After Tax Return', value: taxData.afterTaxReturn }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tax calculator...</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tax & Loss Calculator</h1>
          <p className="text-gray-600 mt-2">Calculate capital gains tax and optimize your tax strategy</p>
        </div>

        {!portfolio?.holdings?.length ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No holdings for tax calculation</h3>
            <p className="text-gray-500 mb-6">Start investing to use the tax calculator</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-500/30"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tax Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Tax Settings</h2>
                  <p className="text-sm text-gray-500">Configure your tax parameters</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capital Gains Tax Rate: {taxRate}%
                  </label>
                  <input
                    type="range"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    min="0"
                    max="30"
                    step="1"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0%</span>
                    <span>30%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Holding Period: {holdingPeriod} year{holdingPeriod > 1 ? 's' : ''}
                  </label>
                  <input
                    type="range"
                    value={holdingPeriod}
                    onChange={(e) => setHoldingPeriod(Number(e.target.value))}
                    min="1"
                    max="10"
                    step="1"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1 year</span>
                    <span>10 years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg shadow-green-500/30 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-100 font-medium">Total Gains</p>
                    <p className="text-2xl font-bold mt-2">
                      ₹{taxData.totalGain.toFixed(2).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg shadow-red-500/30 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-100 font-medium">Total Losses</p>
                    <p className="text-2xl font-bold mt-2">
                      ₹{taxData.totalLoss.toFixed(2).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Tax Amount</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      ₹{taxData.taxAmount.toFixed(2).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Percent className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">After Tax Return</p>
                    <p className={`text-2xl font-bold mt-2 ${taxData.afterTaxReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{taxData.afterTaxReturn.toFixed(2).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${taxData.afterTaxReturn >= 0 ? 'from-green-400 to-emerald-500' : 'from-red-400 to-red-500'} rounded-xl flex items-center justify-center shadow-lg ${taxData.afterTaxReturn >= 0 ? 'shadow-green-500/20' : 'shadow-red-500/20'}`}>
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Gain/Loss Analysis</h2>
                    <p className="text-sm text-gray-500">Realized gains and losses</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={gainLossData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => `₹${value.toFixed(2).toLocaleString('en-IN')}`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="value" fill={(entry) => entry.name === 'Realized Losses' ? '#EF4444' : entry.name === 'Net Position' && entry.value < 0 ? '#EF4444' : '#3B82F6'} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <Percent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Tax Breakdown</h2>
                    <p className="text-sm text-gray-500">Tax impact on returns</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={taxBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3B82F6" />
                      <Cell fill="#EF4444" />
                      <Cell fill="#10B981" />
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toFixed(2).toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Holdings Analysis */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Holdings Analysis</h2>
                  <p className="text-sm text-gray-500">Detailed gain/loss per holding</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Asset</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Purchase Value</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Current Value</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Gain/Loss</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Return %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxData.holdings.map((holding, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{holding.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{holding.type.replace('_', ' ')}</p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-gray-900">
                          ₹{holding.purchaseValue.toFixed(2).toLocaleString('en-IN')}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-900">
                          ₹{holding.currentMarketValue.toFixed(2).toLocaleString('en-IN')}
                        </td>
                        <td className={`text-right py-3 px-4 font-medium ${holding.unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.unrealizedGain >= 0 ? '+' : ''}₹{holding.unrealizedGain.toFixed(2).toLocaleString('en-IN')}
                        </td>
                        <td className={`text-right py-3 px-4 font-medium ${holding.unrealizedGainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.unrealizedGainPercent >= 0 ? '+' : ''}{holding.unrealizedGainPercent.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tax Tips */}
            <div className="bg-blue-50 rounded-xl p-6 flex items-start gap-4">
              <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Tax Optimization Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Hold investments for more than 1 year to qualify for long-term capital gains tax (lower rate)</li>
                  <li>• Consider tax-loss harvesting by selling underperforming assets to offset gains</li>
                  <li>• Review your portfolio at year-end for tax planning opportunities</li>
                  <li>• Consult a tax professional for personalized advice</li>
                </ul>
              </div>
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

export default TaxCalculator;
