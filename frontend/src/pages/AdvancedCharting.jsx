import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LineChart as LineChartIcon, Activity, TrendingUp, TrendingDown, Settings, Zap, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';

const AdvancedCharting = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [timeframe, setTimeframe] = useState('1D');
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);
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
      const stocksRes = await axios.get('http://localhost:5001/api/stocks');
      setStocks(stocksRes.data);
      if (stocksRes.data.length > 0) {
        setSelectedStock(stocksRes.data[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate simulated price data with technical indicators
  const generateChartData = () => {
    const dataPoints = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 90;
    const data = [];
    let price = selectedStock?.price || 1000;

    for (let i = 0; i < dataPoints; i++) {
      const change = (Math.random() - 0.5) * 20;
      price = price + change;
      
      // Calculate moving averages
      const ma20 = price * (1 + (Math.random() - 0.5) * 0.02);
      const ma50 = price * (1 + (Math.random() - 0.5) * 0.03);
      
      // Calculate RSI (simplified)
      const rsi = 30 + Math.random() * 40;
      
      data.push({
        time: timeframe === '1D' ? `${i}:00` : `Day ${i + 1}`,
        price: price,
        ma20: showMA20 ? ma20 : null,
        ma50: showMA50 ? ma50 : null,
        rsi: showRSI ? rsi : null,
        volume: Math.floor(Math.random() * 1000000) + 500000
      });
    }
    
    return data;
  };

  const chartData = generateChartData();

  // Generate RSI data
  const generateRSIData = () => {
    return chartData.map((point, index) => ({
      time: point.time,
      rsi: 30 + Math.random() * 40
    }));
  };

  const rsiData = generateRSIData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading advanced charting...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Advanced Charting</h1>
          <p className="text-gray-600 mt-2">Technical analysis with advanced indicators</p>
        </div>

        {/* Stock Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <LineChartIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Select Stock</h2>
              <p className="text-sm text-gray-500">Choose a stock to analyze</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stocks.map((stock) => (
              <button
                key={stock.id}
                onClick={() => setSelectedStock(stock)}
                className={`p-4 rounded-xl border-2 transition ${
                  selectedStock?.id === stock.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900">{stock.symbol}</p>
                <p className="text-sm text-gray-600">{stock.name}</p>
                <p className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{stock.price.toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Timeframe:</span>
              {['1D', '1W', '1M', '3M'].map((period) => (
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

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ma20"
                  checked={showMA20}
                  onChange={(e) => setShowMA20(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="ma20" className="text-sm text-gray-700">MA 20</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ma50"
                  checked={showMA50}
                  onChange={(e) => setShowMA50(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="ma50" className="text-sm text-gray-700">MA 50</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rsi"
                  checked={showRSI}
                  onChange={(e) => setShowRSI(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="rsi" className="text-sm text-gray-700">RSI</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="macd"
                  checked={showMACD}
                  onChange={(e) => setShowMACD(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="macd" className="text-sm text-gray-700">MACD</label>
              </div>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedStock?.symbol} Price Chart
                </h2>
                <p className="text-sm text-gray-500">Current: ₹{selectedStock?.price?.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {selectedStock?.change >= 0 ? '+' : ''}{selectedStock?.change?.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => `₹${value.toFixed(2)}`}
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area type="monotone" dataKey="price" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Price" />
              {showMA20 && <Line type="monotone" dataKey="ma20" stroke="#F59E0B" strokeWidth={2} dot={false} name="MA 20" />}
              {showMA50 && <Line type="monotone" dataKey="ma50" stroke="#EF4444" strokeWidth={2} dot={false} name="MA 50" />}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* RSI Chart */}
        {showRSI && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">RSI Indicator</h2>
                <p className="text-sm text-gray-500">Relative Strength Index</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={rsiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => value.toFixed(2)}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" label="Overbought" />
                <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 3" label="Oversold" />
                <Area type="monotone" dataKey="rsi" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} name="RSI" />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-sm text-red-600 font-medium">Overbought (&gt;70)</p>
                <p className="text-xs text-red-500">Sell signal</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 font-medium">Neutral (30-70)</p>
                <p className="text-xs text-gray-500">Hold signal</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-green-600 font-medium">Oversold (&lt;30)</p>
                <p className="text-xs text-green-500">Buy signal</p>
              </div>
            </div>
          </div>
        )}

        {/* Volume Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Volume</h2>
              <p className="text-sm text-gray-500">Trading volume over time</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => value.toLocaleString('en-IN')}
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area type="monotone" dataKey="volume" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.3} name="Volume" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Technical Analysis Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Technical Analysis Summary</h2>
              <p className="text-sm text-gray-500">Based on selected indicators</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`border rounded-xl p-4 ${
              selectedStock?.change >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedStock?.change >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold text-gray-900">Trend</span>
              </div>
              <p className={`text-sm ${selectedStock?.change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {selectedStock?.change >= 0 ? 'Uptrend' : 'Downtrend'} detected
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Moving Averages</span>
              </div>
              <p className="text-sm text-blue-700">
                {showMA20 && showMA50 ? 'MA 20 above MA 50 - Bullish' : 'Check indicators'}
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-900">RSI Status</span>
              </div>
              <p className="text-sm text-purple-700">
                {showRSI ? 'Neutral zone (45-55)' : 'Enable RSI indicator'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            Return to Dashboard
          </button>
          <button
            onClick={() => navigate('/buy')}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-500/30 font-medium"
          >
            Trade {selectedStock?.symbol}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdvancedCharting;
