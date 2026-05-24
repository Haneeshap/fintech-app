import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, AlertTriangle, History, BarChart3, Target, Clock, CheckCircle } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'stock',
    itemId: '',
    targetPrice: '',
    condition: 'above',
    alertType: 'price'
  });
  const [loading, setLoading] = useState(true);
  const [notificationHistory, setNotificationHistory] = useState([]);

  useEffect(() => {
    if (user) {
      fetchAlerts();
      fetchInvestments();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/alerts/${user.id}`);
      setAlerts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setLoading(false);
    }
  };

  const fetchInvestments = async () => {
    try {
      const [stocksRes, fundsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/stocks'),
        axios.get('http://localhost:5001/api/mutual-funds')
      ]);
      setStocks(stocksRes.data);
      setMutualFunds(fundsRes.data);
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };

  const handleAddAlert = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5001/api/alerts/${user.id}/add`, newAlert);
      setNewAlert({ type: 'stock', itemId: '', targetPrice: '', condition: 'above' });
      setShowAddForm(false);
      fetchAlerts();
    } catch (error) {
      console.error('Error adding alert:', error);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await axios.delete(`http://localhost:5001/api/alerts/${user.id}/remove/${alertId}`);
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const getInvestmentOptions = () => {
    if (newAlert.type === 'stock') {
      return stocks.map(s => ({ id: s.id, name: `${s.symbol} - ${s.name}`, price: s.price }));
    } else {
      return mutualFunds.map(f => ({ id: f.id, name: f.name, price: f.nav }));
    }
  };

  const checkAlertTriggered = (alert) => {
    const currentPrice = alert.currentPrice;
    const targetPrice = alert.targetPrice;
    
    if (alert.condition === 'above') {
      return currentPrice >= targetPrice;
    } else {
      return currentPrice <= targetPrice;
    }
  };

  const getPriceDistance = (alert) => {
    const currentPrice = alert.currentPrice;
    const targetPrice = alert.targetPrice;
    const distance = Math.abs((targetPrice - currentPrice) / currentPrice * 100);
    return distance.toFixed(2);
  };

  const getAlertStatistics = () => {
    const total = alerts.length;
    const triggered = alerts.filter(a => checkAlertTriggered(a)).length;
    const above = alerts.filter(a => a.condition === 'above').length;
    const below = alerts.filter(a => a.condition === 'below').length;
    
    return [
      { name: 'Active', value: total - triggered },
      { name: 'Triggered', value: triggered }
    ];
  };

  const getAlertTypeDistribution = () => {
    const stocks = alerts.filter(a => a.type === 'stock').length;
    const funds = alerts.filter(a => a.type === 'mutual_fund').length;
    
    return [
      { name: 'Stocks', value: stocks },
      { name: 'Mutual Funds', value: funds }
    ];
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Price Alerts</h1>
            <p className="text-gray-600">Get notified when prices hit your target</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Alert
          </button>
        </div>

        {/* Alert Statistics */}
        {alerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{alerts.filter(a => !checkAlertTriggered(a)).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Triggered</p>
                  <p className="text-2xl font-bold text-gray-900">{alerts.filter(a => checkAlertTriggered(a)).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Above Target</p>
                  <p className="text-2xl font-bold text-gray-900">{alerts.filter(a => a.condition === 'above').length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alert Analytics */}
        {alerts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Alert Status Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Alert Status</h2>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={getAlertStatistics()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getAlertStatistics().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Alert Type Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Alert Types</h2>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={getAlertTypeDistribution()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getAlertTypeDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Add Alert Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Alert</h2>
            <form onSubmit={handleAddAlert} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investment Type</label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value, itemId: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="stock">Stock</option>
                    <option value="mutual_fund">Mutual Fund</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investment</label>
                  <select
                    value={newAlert.itemId}
                    onChange={(e) => setNewAlert({ ...newAlert, itemId: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select investment</option>
                    {getInvestmentOptions().map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name} (₹{option.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAlert.targetPrice}
                    onChange={(e) => setNewAlert({ ...newAlert, targetPrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    value={newAlert.condition}
                    onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="above">Price goes above</option>
                    <option value="below">Price goes below</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Alert
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No price alerts set. Create your first alert to get started!</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-xl shadow-md p-6 ${
                  checkAlertTriggered(alert) ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      alert.condition === 'above' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {alert.condition === 'above' ? (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{alert.itemName}</h3>
                      <p className="text-sm text-gray-500 capitalize">{alert.type.replace('_', ' ')}</p>
                      <div className="mt-2 flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Current Price</p>
                          <p className="text-lg font-bold text-gray-900">₹{alert.currentPrice.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Target Price</p>
                          <p className="text-lg font-bold text-gray-900">₹{alert.targetPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Distance: {getPriceDistance(alert)}%</span>
                        </div>
                        {!checkAlertTriggered(alert) && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <Target className="w-4 h-4" />
                            <span>{alert.condition === 'above' ? 'Waiting for rise' : 'Waiting for fall'}</span>
                          </div>
                        )}
                      </div>
                      {checkAlertTriggered(alert) && (
                        <div className="mt-3 flex items-center gap-2 text-green-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">Alert triggered!</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
