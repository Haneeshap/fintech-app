import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, ArrowRight, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

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
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
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
        )}
      </div>
    </div>
  );
};

export default Compare;
