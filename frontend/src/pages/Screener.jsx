import { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, Search, TrendingUp, TrendingDown, SlidersHorizontal, X } from 'lucide-react';

const Screener = () => {
  const [stocks, setStocks] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [filteredFunds, setFilteredFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minChange: '',
    maxChange: '',
    type: 'all'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, stocks, mutualFunds]);

  const fetchData = async () => {
    try {
      const [stocksRes, fundsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/stocks'),
        axios.get('http://localhost:5001/api/mutual-funds')
      ]);
      setStocks(stocksRes.data);
      setMutualFunds(fundsRes.data);
      setFilteredStocks(stocksRes.data);
      setFilteredFunds(fundsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let resultStocks = [...stocks];
    let resultFunds = [...mutualFunds];

    if (filters.minPrice) {
      resultStocks = resultStocks.filter(s => s.price >= parseFloat(filters.minPrice));
      resultFunds = resultFunds.filter(f => f.nav >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      resultStocks = resultStocks.filter(s => s.price <= parseFloat(filters.maxPrice));
      resultFunds = resultFunds.filter(f => f.nav <= parseFloat(filters.maxPrice));
    }

    if (filters.minChange) {
      resultStocks = resultStocks.filter(s => s.change >= parseFloat(filters.minChange));
    }

    if (filters.maxChange) {
      resultStocks = resultStocks.filter(s => s.change <= parseFloat(filters.maxChange));
    }

    setFilteredStocks(resultStocks);
    setFilteredFunds(resultFunds);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minChange: '',
      maxChange: '',
      type: 'all'
    });
  };

  const getResultsCount = () => {
    if (filters.type === 'stock') return filteredStocks.length;
    if (filters.type === 'mutual_fund') return filteredFunds.length;
    return filteredStocks.length + filteredFunds.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading screener...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Screener</h1>
            <p className="text-gray-600">Filter and find the best investment opportunities</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Filter Options</h2>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investment Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="stock">Stocks</option>
                  <option value="mutual_fund">Mutual Funds</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₹)</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₹)</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="10000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Change (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="minChange"
                  value={filters.minChange}
                  onChange={handleFilterChange}
                  placeholder="-10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Change (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="maxChange"
                  value={filters.maxChange}
                  onChange={handleFilterChange}
                  placeholder="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">
                <span className="font-semibold">{getResultsCount()}</span> results found
              </span>
            </div>
            {(filters.minPrice || filters.maxPrice || filters.minChange || filters.maxChange) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {(filters.type === 'all' || filters.type === 'stock') && filteredStocks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Stocks</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredStocks.map((stock) => (
                  <div
                    key={stock.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{stock.symbol}</h3>
                        <p className="text-sm text-gray-600">{stock.name}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${
                        stock.change >= 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {stock.change >= 0 ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">₹{stock.price.toFixed(2)}</p>
                        <p className={`text-sm font-medium ${
                          stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(filters.type === 'all' || filters.type === 'mutual_fund') && filteredFunds.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mutual Funds</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFunds.map((fund) => (
                  <div
                    key={fund.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{fund.name}</h3>
                      <p className="text-sm text-gray-600">{fund.category}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">NAV</span>
                        <span className="font-semibold text-gray-900">₹{fund.nav.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">1Y Return</span>
                        <span className="font-semibold text-green-600">{fund.returns['1Y']}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">3Y Return</span>
                        <span className="font-semibold text-green-600">{fund.returns['3Y']}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">5Y Return</span>
                        <span className="font-semibold text-green-600">{fund.returns['5Y']}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {getResultsCount() === 0 && (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No results found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Screener;
