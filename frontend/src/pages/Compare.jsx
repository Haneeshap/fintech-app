import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, ArrowRight, TrendingUp, TrendingDown, BarChart3, Shield, Zap, Award, Activity, Calculator, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const Compare = () => {
  const [stocks, setStocks] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stocksRes, fundsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/stocks'),
        axios.get('http://localhost:5001/api/mutual-funds')
      ]);
      setStocks(stocksRes.data);
      setMutualFunds(fundsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const allItems = [
    ...stocks.map(s => ({ ...s, category: 'stock' })),
    ...mutualFunds.map(f => ({ ...f, category: 'mutual_fund' }))
  ];

  const addItem = (item) => {
    if (selectedItems.length < 4 && !selectedItems.find(i => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeItem = (itemId) => {
    setSelectedItems(selectedItems.filter(i => i.id !== itemId));
  };

  const compareItems = async () => {
    if (selectedItems.length < 2) return;
    
    try {
      const response = await axios.post('http://localhost:5001/api/compare', {
        items: selectedItems.map(i => i.id)
      });
      setComparisonData(response.data);
    } catch (error) {
      console.error('Error comparing items:', error);
    }
  };

  // Calculate additional metrics for comparison
  const calculateDetailedMetrics = (item) => {
    const basePrice = item.price || item.nav || 0;
    const change = item.change || 0;
    
    // Mock calculations for demonstration
    const volatility = (Math.random() * 20 + 5).toFixed(2);
    const riskScore = (Math.random() * 10 + 1).toFixed(1);
    const sharpeRatio = (Math.random() * 3 + 0.5).toFixed(2);
    const beta = (Math.random() * 2 + 0.5).toFixed(2);
    const peRatio = item.type === 'stock' ? (Math.random() * 50 + 10).toFixed(2) : '-';
    const marketCap = item.type === 'stock' ? `₹${(Math.random() * 100000 + 10000).toFixed(0)} Cr` : '-';
    
    return {
      volatility: parseFloat(volatility),
      riskScore: parseFloat(riskScore),
      sharpeRatio: parseFloat(sharpeRatio),
      beta: parseFloat(beta),
      peRatio,
      marketCap,
      recommendation: change > 0 ? 'Buy' : change < -2 ? 'Sell' : 'Hold',
      overallScore: ((change + 10) * 5 + (10 - volatility) * 3 + sharpeRatio * 2).toFixed(0)
    };
  };

  const getRadarData = () => {
    if (comparisonData.length === 0) return [];
    
    const metrics = ['Returns', 'Stability', 'Liquidity', 'Growth', 'Value'];
    
    return comparisonData.map(item => {
      const detailed = calculateDetailedMetrics(item);
      return {
        name: item.name || item.symbol,
        Returns: (item.change || 0) + 10,
        Stability: 10 - detailed.volatility / 2,
        Liquidity: Math.random() * 5 + 5,
        Growth: (item.returns?.['1Y'] || 10) / 2,
        Value: 10 - parseFloat(detailed.riskScore)
      };
    });
  };

  const getPerformanceData = () => {
    if (comparisonData.length === 0) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return months.map(month => {
      const dataPoint = { month };
      comparisonData.forEach(item => {
        const baseValue = item.price || item.nav || 100;
        const randomChange = (Math.random() - 0.4) * 10;
        dataPoint[item.name || item.symbol] = Math.max(baseValue + randomChange, 50);
      });
      return dataPoint;
    });
  };

  useEffect(() => {
    if (selectedItems.length >= 2) {
      compareItems();
    }
  }, [selectedItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Investments</h1>
          <p className="text-gray-600">Compare stocks and mutual funds side by side</p>
        </div>

        {/* Selected Items */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Selected Items ({selectedItems.length}/4)</h2>
          </div>
          
          {selectedItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center border-2 border-dashed border-gray-300">
              <p className="text-gray-500">Select items to compare (minimum 2, maximum 4)</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2"
                >
                  <span className="font-medium text-blue-900">{item.name || item.symbol}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Items */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Investments</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allItems.map((item) => {
              const isSelected = selectedItems.find(i => i.id === item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
                  }`}
                  onClick={() => !isSelected && addItem(item)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name || item.symbol}</h3>
                      <p className="text-sm text-gray-500">{item.category === 'stock' ? 'Stock' : 'Mutual Fund'}</p>
                    </div>
                    {!isSelected && selectedItems.length < 4 && (
                      <Plus className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{item.price?.toFixed(2) || item.nav?.toFixed(2)}
                    </span>
                    {item.change && (
                      <span className={`flex items-center text-sm ${
                        item.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.change >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {item.change.toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison Table */}
        {comparisonData.length >= 2 && (
          <>
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {comparisonData.map((item) => {
                const metrics = calculateDetailedMetrics(item);
                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">{item.name || item.symbol}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        metrics.recommendation === 'Buy' ? 'bg-green-100 text-green-700' :
                        metrics.recommendation === 'Sell' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {metrics.recommendation}
                      </div>
                    </div>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-blue-600">{metrics.overallScore}</div>
                      <div className="text-sm text-gray-500">Overall Score</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Risk Score</span>
                        <span className="font-medium">{metrics.riskScore}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Volatility</span>
                        <span className="font-medium">{metrics.volatility}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sharpe Ratio</span>
                        <span className="font-medium">{metrics.sharpeRatio}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Performance Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">6-Month Performance</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getPerformanceData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
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
                  {comparisonData.map((item, index) => (
                    <Bar 
                      key={item.id} 
                      dataKey={item.name || item.symbol} 
                      fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Multi-Dimensional Comparison</h2>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={getRadarData()}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="name" stroke="#6b7280" />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="#6b7280" />
                  {comparisonData.map((item, index) => (
                    <Radar
                      key={item.id}
                      name={item.name || item.symbol}
                      dataKey={item.name || item.symbol}
                      stroke={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]}
                      fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Comparison Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Detailed Metrics</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Metric
                      </th>
                      {comparisonData.map((item) => (
                        <th key={item.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {item.name || item.symbol}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Type</td>
                      {comparisonData.map((item) => (
                        <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.type === 'stock' ? 'Stock' : 'Mutual Fund'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Current Price</td>
                      {comparisonData.map((item) => (
                        <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{item.price?.toFixed(2) || item.nav?.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Change</td>
                      {comparisonData.map((item) => (
                        <td key={item.id} className={`px-6 py-4 whitespace-nowrap text-sm ${
                          item.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.change?.toFixed(2) || '-'}%
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Volatility</td>
                      {comparisonData.map((item) => {
                        const metrics = calculateDetailedMetrics(item);
                        return (
                          <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metrics.volatility}%
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Risk Score</td>
                      {comparisonData.map((item) => {
                        const metrics = calculateDetailedMetrics(item);
                        return (
                          <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metrics.riskScore}/10
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Sharpe Ratio</td>
                      {comparisonData.map((item) => {
                        const metrics = calculateDetailedMetrics(item);
                        return (
                          <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metrics.sharpeRatio}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Beta</td>
                      {comparisonData.map((item) => {
                        const metrics = calculateDetailedMetrics(item);
                        return (
                          <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metrics.beta}
                          </td>
                        );
                      })}
                    </tr>
                    {comparisonData.some(item => item.type === 'stock') && (
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">P/E Ratio</td>
                        {comparisonData.map((item) => {
                          const metrics = calculateDetailedMetrics(item);
                          return (
                            <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {metrics.peRatio}
                            </td>
                          );
                        })}
                      </tr>
                    )}
                    {comparisonData.some(item => item.type === 'stock') && (
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Market Cap</td>
                        {comparisonData.map((item) => {
                          const metrics = calculateDetailedMetrics(item);
                          return (
                            <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {metrics.marketCap}
                            </td>
                          );
                        })}
                      </tr>
                    )}
                    {comparisonData[0].category && comparisonData[0].category === 'mutual_fund' && (
                      <>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Category</td>
                          {comparisonData.map((item) => (
                            <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.category || '-'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1Y Returns</td>
                          {comparisonData.map((item) => (
                            <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.returns?.['1Y'] ? `${item.returns['1Y']}%` : '-'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">3Y Returns</td>
                          {comparisonData.map((item) => (
                            <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.returns?.['3Y'] ? `${item.returns['3Y']}%` : '-'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">5Y Returns</td>
                          {comparisonData.map((item) => (
                            <td key={item.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.returns?.['5Y'] ? `${item.returns['5Y']}%` : '-'}
                            </td>
                          ))}
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Compare;
