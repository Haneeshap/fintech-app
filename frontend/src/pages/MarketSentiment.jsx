import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, BarChart3, Zap, AlertCircle, ThumbsUp, ThumbsDown, Minus, Brain, Eye, Target, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const MarketSentiment = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('1M');
  const [sentimentData, setSentimentData] = useState({
    overall: 'Bullish',
    score: 72,
    fearGreedIndex: 65,
    volatilityIndex: 18,
    volumeTrend: 'Increasing',
    institutionalActivity: 'Buying'
  });

  const sentimentHistory = [
    { date: 'Week 1', sentiment: 68, volume: 45000, institutional: 55 },
    { date: 'Week 2', sentiment: 71, volume: 48000, institutional: 58 },
    { date: 'Week 3', sentiment: 65, volume: 42000, institutional: 52 },
    { date: 'Week 4', sentiment: 72, volume: 51000, institutional: 62 },
  ];

  const sectorSentiment = [
    { sector: 'Technology', sentiment: 78, trend: 'up', change: '+5.2%' },
    { sector: 'Banking', sentiment: 65, trend: 'up', change: '+2.1%' },
    { sector: 'Healthcare', sentiment: 58, trend: 'down', change: '-1.8%' },
    { sector: 'Energy', sentiment: 72, trend: 'up', change: '+3.4%' },
    { sector: 'Consumer', sentiment: 62, trend: 'neutral', change: '+0.5%' },
    { sector: 'Infrastructure', sentiment: 68, trend: 'up', change: '+2.8%' },
  ];

  const marketIndicators = [
    { name: 'NIFTY 50', value: 22456, change: 125.30, changePercent: 0.56, sentiment: 'bullish' },
    { name: 'SENSEX', value: 74234, change: 423.20, changePercent: 0.57, sentiment: 'bullish' },
    { name: 'NIFTY BANK', value: 47890, change: 234.50, changePercent: 0.49, sentiment: 'bullish' },
    { name: 'NIFTY IT', value: 34567, change: -123.40, changePercent: -0.36, sentiment: 'bearish' },
  ];

  const socialSentiment = [
    { platform: 'Twitter', positive: 65, negative: 20, neutral: 15 },
    { platform: 'News', positive: 58, negative: 25, neutral: 17 },
    { platform: 'Analyst', positive: 72, negative: 15, neutral: 13 },
  ];

  const getSentimentColor = (sentiment) => {
    if (sentiment >= 70) return 'text-green-600 bg-green-100';
    if (sentiment >= 50) return 'text-blue-600 bg-blue-100';
    if (sentiment >= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment >= 70) return <TrendingUp className="w-5 h-5" />;
    if (sentiment >= 50) return <Activity className="w-5 h-5" />;
    if (sentiment >= 30) return <Minus className="w-5 h-5" />;
    return <TrendingDown className="w-5 h-5" />;
  };

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
          <h1 className="text-2xl font-semibold text-gray-900">Market Sentiment Analysis</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time market sentiment and investor behavior insights</p>
        </div>

        {/* Overall Sentiment Score */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/30 p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-8 h-8" />
                <span className="text-xl font-medium">Overall Market Sentiment</span>
              </div>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-6xl font-bold">{sentimentData.score}</span>
                <span className="text-2xl text-blue-100">/ 100</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                {sentimentData.score >= 70 ? (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">Bullish</span>
                  </>
                ) : sentimentData.score >= 50 ? (
                  <>
                    <Activity className="w-5 h-5" />
                    <span className="font-semibold">Neutral</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-5 h-5" />
                    <span className="font-semibold">Bearish</span>
                  </>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                {getSentimentIcon(sentimentData.score)}
              </div>
            </div>
          </div>
        </div>

        {/* Key Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fear & Greed</p>
                <p className="text-2xl font-bold text-gray-900">{sentimentData.fearGreedIndex}</p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all"
                style={{ width: `${sentimentData.fearGreedIndex}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Volatility</p>
                <p className="text-2xl font-bold text-gray-900">{sentimentData.volatilityIndex}</p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all"
                style={{ width: `${sentimentData.volatilityIndex * 3}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Volume Trend</p>
                <p className="text-lg font-bold text-gray-900">{sentimentData.volumeTrend}</p>
              </div>
            </div>
            <div className={`text-sm font-medium ${sentimentData.volumeTrend === 'Increasing' ? 'text-green-600' : 'text-red-600'}`}>
              {sentimentData.volumeTrend === 'Increasing' ? '↑ High Activity' : '↓ Low Activity'}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Institutional</p>
                <p className="text-lg font-bold text-gray-900">{sentimentData.institutionalActivity}</p>
              </div>
            </div>
            <div className={`text-sm font-medium ${sentimentData.institutionalActivity === 'Buying' ? 'text-green-600' : 'text-red-600'}`}>
              {sentimentData.institutionalActivity === 'Buying' ? 'Net Buyers' : 'Net Sellers'}
            </div>
          </div>
        </div>

        {/* Sentiment History Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <LineChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Sentiment History</h2>
                <p className="text-sm text-gray-500">Market sentiment over time</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['1W', '1M', '3M', '1Y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    timeframe === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => value}
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area type="monotone" dataKey="sentiment" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Sentiment Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Sentiment */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sector Sentiment</h2>
              <p className="text-sm text-gray-500">Sentiment analysis by sector</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectorSentiment.map((sector, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{sector.sector}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(sector.sentiment)}`}>
                    {sector.sentiment}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sector.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : sector.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    ) : (
                      <Minus className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className={`text-sm font-medium ${sector.trend === 'up' ? 'text-green-600' : sector.trend === 'down' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {sector.change}
                    </span>
                  </div>
                  <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${sector.sentiment >= 70 ? 'bg-green-500' : sector.sentiment >= 50 ? 'bg-blue-500' : sector.sentiment >= 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${sector.sentiment}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Indices */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Market Indices</h2>
              <p className="text-sm text-gray-500">Current market performance</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketIndicators.map((index, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                <h3 className="font-semibold text-gray-900 mb-2">{index.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {index.value.toLocaleString('en-IN')}
                </p>
                <div className={`flex items-center gap-1 text-sm font-medium ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {index.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Sentiment */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Social Sentiment</h2>
              <p className="text-sm text-gray-500">Social media and news sentiment analysis</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {socialSentiment.map((platform, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">{platform.platform}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Positive</span>
                        <span className="font-medium text-green-600">{platform.positive}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${platform.positive}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Minus className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Neutral</span>
                        <span className="font-medium text-gray-600">{platform.neutral}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-400" style={{ width: `${platform.neutral}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ThumbsDown className="w-4 h-4 text-red-600" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Negative</span>
                        <span className="font-medium text-red-600">{platform.negative}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${platform.negative}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Breadth */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Market Breadth</h2>
              <p className="text-sm text-gray-500">Overall market participation and direction</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketBreadth.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">{item.metric}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-gray-900">{item.value}</span>
                  <span className="text-sm text-gray-500">/ {item.total}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.metric === 'Advancing Stocks' ? 'bg-green-500' : item.metric === 'Declining Stocks' ? 'bg-red-500' : 'bg-gray-400'}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-gray-600 mt-2">{item.percentage}% of total</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Prediction */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Sentiment Prediction</h2>
              <p className="text-sm text-gray-500">Machine learning-based sentiment forecast</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sentimentPrediction}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#6b7280" />
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
              <Bar dataKey="current" fill="#3B82F6" name="Current" radius={[4, 4, 0, 0]} />
              <Bar dataKey="predicted" fill="#10B981" name="Predicted" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {sentimentPrediction.map((item, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{item.period} Confidence</p>
                <p className="text-lg font-bold text-blue-600">{item.confidence}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Retail vs Institutional */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Investor Type Sentiment</h2>
              <p className="text-sm text-gray-500">Comparison across different investor categories</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={retailVsInstitutional}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="category" stroke="#6b7280" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
              <Radar
                name="Sentiment Score"
                dataKey="value"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
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
            onClick={() => navigate('/news')}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-500/30 font-medium"
          >
            View Market News
          </button>
        </div>
      </main>
    </div>
  );
};

export default MarketSentiment;
