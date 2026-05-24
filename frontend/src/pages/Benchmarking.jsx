import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Activity, Target, Award, Calendar } from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const Benchmarking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1Y');
  const [selectedBenchmark, setSelectedBenchmark] = useState('NIFTY 50');

  const benchmarks = [
    { name: 'NIFTY 50', value: 22456.80, change: 125.30, changePercent: 0.56 },
    { name: 'SENSEX', value: 74234.50, change: 423.20, changePercent: 0.57 },
    { name: 'NIFTY BANK', value: 47890.30, change: 234.50, changePercent: 0.49 },
    { name: 'NIFTY IT', value: 34567.80, change: -123.40, changePercent: -0.36 },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const portfolioRes = await axios.get(`http://localhost:5001/api/portfolio/${user.id}`);
      setPortfolio(portfolioRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate simulated performance data
  const generatePerformanceData = () => {
    const months = timeframe === '1M' ? 4 : timeframe === '3M' ? 12 : timeframe === '6M' ? 24 : 12;
    const data = [];
    
    for (let i = 0; i < months; i++) {
      const portfolioReturn = 10 + Math.random() * 15;
      const benchmarkReturn = 8 + Math.random() * 12;
      
      data.push({
        period: `Month ${i + 1}`,
        portfolio: portfolioReturn,
        benchmark: benchmarkReturn,
        difference: portfolioReturn - benchmarkReturn
      });
    }
    
    return data;
  };

  const performanceData = generatePerformanceData();

  const calculateMetrics = () => {
    if (!portfolio?.totalValue) {
      return {
        portfolioReturn: 0,
        benchmarkReturn: 0,
        alpha: 0,
        beta: 1,
        sharpeRatio: 0,
        maxDrawdown: 0
      };
    }

    const portfolioReturn = 15.5 + Math.random() * 10;
    const benchmarkReturn = 12.3 + Math.random() * 8;
    const alpha = portfolioReturn - benchmarkReturn;
    const beta = 0.8 + Math.random() * 0.4;
    const sharpeRatio = (portfolioReturn - 5) / (10 + Math.random() * 5);
    const maxDrawdown = -(5 + Math.random() * 10);

    return {
      portfolioReturn,
      benchmarkReturn,
      alpha,
      beta,
      sharpeRatio,
      maxDrawdown
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading benchmarking data...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Benchmarking</h1>
          <p className="text-gray-600 mt-2">Compare your portfolio performance against market indices</p>
        </div>

        {!portfolio?.holdings?.length ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No holdings to benchmark</h3>
            <p className="text-gray-500 mb-6">Start investing to use benchmarking analysis</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-500/30"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Benchmark Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Select Benchmark</h2>
                  <p className="text-sm text-gray-500">Choose an index to compare against</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {benchmarks.map((benchmark, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedBenchmark(benchmark.name)}
                    className={`p-4 rounded-xl border-2 transition ${
                      selectedBenchmark === benchmark.name
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{benchmark.name}</p>
                    <p className={`text-sm ${benchmark.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {benchmark.change >= 0 ? '+' : ''}{benchmark.change.toFixed(2)} ({benchmark.changePercent >= 0 ? '+' : ''}{benchmark.changePercent}%)
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe Selection */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Timeframe:</span>
              {['1M', '3M', '6M', '1Y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    timeframe === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Portfolio Return</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{metrics.portfolioReturn.toFixed(2)}%</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Benchmark Return</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{metrics.benchmarkReturn.toFixed(2)}%</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Alpha</span>
                </div>
                <p className={`text-2xl font-bold ${metrics.alpha >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.alpha >= 0 ? '+' : ''}{metrics.alpha.toFixed(2)}%
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-gray-600">Beta</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{metrics.beta.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Sharpe Ratio</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{metrics.sharpeRatio.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-gray-600">Max Drawdown</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{metrics.maxDrawdown.toFixed(2)}%</p>
              </div>
            </div>

            {/* Performance Comparison Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Performance Comparison</h2>
                  <p className="text-sm text-gray-500">Portfolio vs {selectedBenchmark}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#6b7280" />
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
                  <Legend />
                  <Line type="monotone" dataKey="portfolio" stroke="#3B82F6" strokeWidth={2} name="Portfolio" dot={{ fill: '#3B82F6' }} />
                  <Line type="monotone" dataKey="benchmark" stroke="#10B981" strokeWidth={2} name={selectedBenchmark} dot={{ fill: '#10B981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Difference Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Performance Difference</h2>
                  <p className="text-sm text-gray-500">Portfolio outperformance/underperformance</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="difference" fill={(entry) => entry.difference >= 0 ? '#10B981' : '#EF4444'} radius={[8, 8, 0, 0]} name="Difference" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Performance Summary</h2>
                  <p className="text-sm text-gray-500">Key takeaways from the analysis</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className={`border rounded-xl p-4 flex items-start gap-4 ${
                  metrics.alpha >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    metrics.alpha >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {metrics.alpha >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      metrics.alpha >= 0 ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {metrics.alpha >= 0 ? 'Outperforming' : 'Underperforming'} Benchmark
                    </h3>
                    <p className={`text-sm ${
                      metrics.alpha >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Your portfolio has {metrics.alpha >= 0 ? 'generated' : 'lost'} an alpha of {Math.abs(metrics.alpha).toFixed(2)}% compared to {selectedBenchmark}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Risk-Adjusted Performance</h3>
                    <p className="text-sm text-blue-700">
                      Sharpe Ratio of {metrics.sharpeRatio.toFixed(2)} indicates {metrics.sharpeRatio > 1 ? 'good' : 'moderate'} risk-adjusted returns
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900">Volatility Analysis</h3>
                    <p className="text-sm text-purple-700">
                      Beta of {metrics.beta.toFixed(2)} suggests your portfolio is {metrics.beta > 1 ? 'more volatile' : 'less volatile'} than the benchmark
                    </p>
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

export default Benchmarking;
