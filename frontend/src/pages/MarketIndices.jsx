import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

const MarketIndices = () => {
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndices();
  }, []);

  const fetchIndices = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/indices');
      setIndices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching indices:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading market indices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Indices</h1>
          <p className="text-gray-600">Real-time market performance indicators</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {indices.map((index) => (
            <div
              key={index.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    index.change >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {index.change >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{index.name}</h3>
                    <p className="text-sm text-gray-500">Market Index</p>
                  </div>
                </div>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold text-gray-900">
                    {index.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div className={`flex items-center gap-1 ${
                    index.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {index.change >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="font-semibold">
                      {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
                    </span>
                    <span className="text-sm">
                      ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Day High</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {index.high.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Day Low</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {index.low.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Market Overview</h3>
          </div>
          <p className="text-gray-600">
            Track the performance of major Indian market indices including NIFTY 50, SENSEX, NIFTY BANK, and NIFTY IT. 
            These indices represent the overall market sentiment and help investors make informed decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketIndices;
