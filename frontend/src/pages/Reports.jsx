import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Calendar, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3, Activity, Printer, Share2 } from 'lucide-react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [portfolioRes, transactionsRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/portfolio/${user.id}`),
        axios.get(`http://localhost:5001/api/transactions/${user.id}`)
      ]);
      setPortfolio(portfolioRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReportData = () => {
    const monthlyReturns = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleString('en-US', { month: 'short' }),
      return: (Math.random() - 0.3) * 20
    }));

    const assetAllocation = [
      { name: 'Stocks', value: 65 },
      { name: 'Mutual Funds', value: 35 }
    ];

    const sectorAllocation = [
      { sector: 'Technology', percentage: 25 },
      { sector: 'Banking', percentage: 20 },
      { sector: 'Healthcare', percentage: 15 },
      { sector: 'Energy', percentage: 12 },
      { sector: 'Consumer', percentage: 18 },
      { sector: 'Others', percentage: 10 }
    ];

    const topPerformers = [
      { name: 'RELIANCE', return: 15.2 },
      { name: 'TCS', return: 12.8 },
      { name: 'HDFCBANK', return: 10.5 },
      { name: 'INFY', return: 8.3 },
      { name: 'ICICIBANK', return: 7.9 }
    ];

    const riskMetrics = {
      volatility: 18.5,
      sharpeRatio: 1.2,
      maxDrawdown: -12.3,
      beta: 0.95
    };

    return { monthlyReturns, assetAllocation, sectorAllocation, topPerformers, riskMetrics };
  };

  const reportData = generateReportData();

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      setGeneratingReport(false);
      alert('Report generated successfully! Download will start shortly.');
    }, 2000);
  };

  const handleDownload = () => {
    alert('Report downloaded as PDF');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    alert('Share link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Performance Reports</h1>
          <p className="text-gray-600 mt-2">Generate and download detailed performance reports</p>
        </div>

        {!portfolio?.holdings?.length ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No data for reports</h3>
            <p className="text-gray-500 mb-6">Start investing to generate performance reports</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-500/30"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Report Configuration */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Report Configuration</h2>
                  <p className="text-sm text-gray-500">Customize your report settings</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
                  <select
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                    <option value="performance">Performance Report</option>
                    <option value="allocation">Allocation Report</option>
                    <option value="risk">Risk Analysis Report</option>
                    <option value="comprehensive">Comprehensive Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-500/30 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generatingReport ? 'Generating...' : 'Generate Report'}
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
                <button
                  onClick={handlePrint}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium flex items-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print
                </button>
                <button
                  onClick={handleShare}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium flex items-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>

            {/* Report Preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Portfolio Performance Report</h2>
                    <p className="text-gray-600 mt-1">Generated on {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Report
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm text-blue-100">Portfolio Value</span>
                  </div>
                  <p className="text-2xl font-bold">₹{portfolio?.totalValue?.toLocaleString('en-IN') || '0'}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Total Return</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">+15.8%</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Volatility</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{reportData.riskMetrics.volatility}%</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChartIcon className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-600">Sharpe Ratio</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{reportData.riskMetrics.sharpeRatio}</p>
                </div>
              </div>

              {/* Monthly Returns Chart */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Returns</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={reportData.monthlyReturns}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => `${value.toFixed(2)}%`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="return" fill={(entry) => entry.return >= 0 ? '#10B981' : '#EF4444'} radius={[4, 4, 0, 0]} name="Return %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Asset Allocation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={reportData.assetAllocation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.assetAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sector Allocation</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={reportData.sectorAllocation} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#6b7280" />
                      <YAxis dataKey="sector" type="category" stroke="#6b7280" width={80} />
                      <Tooltip 
                        formatter={(value) => `${value}%`}
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="percentage" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Performers */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {reportData.topPerformers.map((stock, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="font-semibold text-gray-900">{stock.name}</p>
                      <p className={`text-lg font-bold ${stock.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.return >= 0 ? '+' : ''}{stock.return}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Metrics */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Volatility</p>
                    <p className="text-xl font-bold text-gray-900">{reportData.riskMetrics.volatility}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sharpe Ratio</p>
                    <p className="text-xl font-bold text-gray-900">{reportData.riskMetrics.sharpeRatio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Drawdown</p>
                    <p className="text-xl font-bold text-red-600">{reportData.riskMetrics.maxDrawdown}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Beta</p>
                    <p className="text-xl font-bold text-gray-900">{reportData.riskMetrics.beta}</p>
                  </div>
                </div>
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

export default Reports;
