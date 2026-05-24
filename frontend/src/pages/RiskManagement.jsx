import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, Target, Calculator, TrendingDown, TrendingUp, Info, CheckCircle } from 'lucide-react';
import axios from 'axios';

const RiskManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stop Loss Calculator State
  const [entryPrice, setEntryPrice] = useState(1000);
  const [riskPercentage, setRiskPercentage] = useState(5);
  const [stopLossPrice, setStopLossPrice] = useState(950);
  const [positionSize, setPositionSize] = useState(10000);
  const [riskAmount, setRiskAmount] = useState(50);

  // Position Sizing Calculator State
  const [accountBalance, setAccountBalance] = useState(100000);
  const [riskPerTrade, setRiskPerTrade] = useState(2);
  const [entryPrice2, setEntryPrice2] = useState(1000);
  const [stopLossPrice2, setStopLossPrice2] = useState(950);
  const [positionSize2, setPositionSize2] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [portfolioRes, stocksRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/portfolio/${user.id}`),
        axios.get('http://localhost:5001/api/stocks')
      ]);
      setPortfolio(portfolioRes.data);
      setStocks(stocksRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stop loss
  useEffect(() => {
    const calculatedStopLoss = entryPrice * (1 - riskPercentage / 100);
    setStopLossPrice(calculatedStopLoss);
    const calculatedRiskAmount = (entryPrice - calculatedStopLoss) * (positionSize / entryPrice);
    setRiskAmount(calculatedRiskAmount);
  }, [entryPrice, riskPercentage, positionSize]);

  // Calculate position size
  useEffect(() => {
    const riskPerTradeAmount = accountBalance * (riskPerTrade / 100);
    const riskPerShare = entryPrice2 - stopLossPrice2;
    if (riskPerShare > 0) {
      const calculatedPositionSize = (riskPerTradeAmount / riskPerShare) * entryPrice2;
      setPositionSize2(calculatedPositionSize);
    }
  }, [accountBalance, riskPerTrade, entryPrice2, stopLossPrice2]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading risk management tools...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Risk Management Tools</h1>
          <p className="text-gray-600 mt-2">Calculate stop-loss levels and optimal position sizes</p>
        </div>

        {!portfolio?.holdings?.length ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No holdings for risk analysis</h3>
            <p className="text-gray-500 mb-6">Start investing to use risk management tools</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-500/30"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stop Loss Calculator */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Stop Loss Calculator</h2>
                  <p className="text-sm text-gray-500">Calculate optimal stop-loss levels for your trades</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entry Price (₹)
                  </label>
                  <input
                    type="number"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Percentage (%)
                  </label>
                  <input
                    type="range"
                    value={riskPercentage}
                    onChange={(e) => setRiskPercentage(Number(e.target.value))}
                    min="1"
                    max="20"
                    step="0.5"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1%</span>
                    <span className="font-medium text-gray-900">{riskPercentage}%</span>
                    <span>20%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Size (₹)
                  </label>
                  <input
                    type="number"
                    value={positionSize}
                    onChange={(e) => setPositionSize(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stop Loss Price (₹)
                  </label>
                  <div className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                    <span className="text-2xl font-bold text-red-600">₹{stopLossPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-900">Risk Amount</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">₹{riskAmount.toFixed(2)}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Risk/Reward Ratio</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">1:2</p>
                </div>
              </div>
            </div>

            {/* Position Sizing Calculator */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Position Sizing Calculator</h2>
                  <p className="text-sm text-gray-500">Calculate optimal position size based on risk tolerance</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Balance (₹)
                  </label>
                  <input
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Per Trade (%)
                  </label>
                  <input
                    type="range"
                    value={riskPerTrade}
                    onChange={(e) => setRiskPerTrade(Number(e.target.value))}
                    min="0.5"
                    max="5"
                    step="0.5"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0.5%</span>
                    <span className="font-medium text-gray-900">{riskPerTrade}%</span>
                    <span>5%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entry Price (₹)
                  </label>
                  <input
                    type="number"
                    value={entryPrice2}
                    onChange={(e) => setEntryPrice2(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stop Loss Price (₹)
                  </label>
                  <input
                    type="number"
                    value={stopLossPrice2}
                    onChange={(e) => setStopLossPrice2(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    min="0"
                  />
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5" />
                      <span className="font-medium">Recommended Position Size</span>
                    </div>
                    <p className="text-4xl font-bold">₹{positionSize2.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100">Risk Amount</p>
                    <p className="text-2xl font-semibold">₹{(accountBalance * riskPerTrade / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Management Tips */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Risk Management Best Practices</h2>
                  <p className="text-sm text-gray-500">Essential guidelines for managing investment risk</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Use Stop Losses</h3>
                    <p className="text-sm text-green-700">Always set stop-loss levels to limit potential losses on each trade.</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-4">
                  <Target className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Position Sizing</h3>
                    <p className="text-sm text-blue-700">Never risk more than 1-2% of your account on a single trade.</p>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-4">
                  <TrendingUp className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-1">Risk/Reward Ratio</h3>
                    <p className="text-sm text-purple-700">Aim for at least 1:2 risk/reward ratio on all trades.</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4">
                  <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Diversification</h3>
                    <p className="text-sm text-red-700">Spread your investments across different assets to reduce concentration risk.</p>
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

export default RiskManagement;
