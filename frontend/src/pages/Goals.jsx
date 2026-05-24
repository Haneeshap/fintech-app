import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Target, Plus, Trash2, TrendingUp, Calendar, DollarSign, Edit2, CheckCircle, PieChart, BarChart3, AlertCircle, Star } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: 'retirement'
  });
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'retirement', name: 'Retirement', color: 'bg-purple-100 text-purple-800' },
    { id: 'education', name: 'Education', color: 'bg-blue-100 text-blue-800' },
    { id: 'home', name: 'Home Purchase', color: 'bg-green-100 text-green-800' },
    { id: 'emergency', name: 'Emergency Fund', color: 'bg-red-100 text-red-800' },
    { id: 'vacation', name: 'Vacation', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'other', name: 'Other', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/goals/${user.id}`);
      setGoals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5001/api/goals/${user.id}/add`, newGoal);
      setNewGoal({ name: '', targetAmount: '', currentAmount: '', targetDate: '', category: 'retirement' });
      setShowAddForm(false);
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleUpdateGoal = async (goalId, currentAmount) => {
    try {
      await axios.put(`http://localhost:5001/api/goals/${user.id}/update/${goalId}`, { currentAmount });
      setEditingGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await axios.delete(`http://localhost:5001/api/goals/${user.id}/remove/${goalId}`);
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[categories.length - 1];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTotalProgress = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round(totalProgress / goals.length);
  };

  const getTotalTargetAmount = () => {
    return goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  };

  const getTotalCurrentAmount = () => {
    return goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  };

  const getGoalDistributionData = () => {
    return goals.map(goal => ({
      name: goal.name,
      value: goal.currentAmount,
      target: goal.targetAmount
    }));
  };

  const getMonthlyContributionSuggestion = (goal) => {
    const daysRemaining = getDaysRemaining(goal.targetDate);
    if (daysRemaining <= 0) return 0;
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const monthsRemaining = Math.ceil(daysRemaining / 30);
    return Math.ceil(remainingAmount / monthsRemaining);
  };

  const getPriorityScore = (goal) => {
    const daysRemaining = getDaysRemaining(goal.targetDate);
    const progress = goal.progress;
    const urgency = daysRemaining <= 365 ? 2 : daysRemaining <= 1825 ? 1 : 0;
    const behindSchedule = progress < (1 - daysRemaining / 3650) * 100 ? 1 : 0;
    return urgency + behindSchedule;
  };

  const getSortedGoals = () => {
    return [...goals].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Goals</h1>
            <p className="text-gray-600">Set and track your financial goals</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Goal
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Saved</p>
                <p className="text-2xl font-bold text-gray-900">₹{getTotalCurrentAmount().toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Target Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{getTotalTargetAmount().toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalProgress()}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Analytics */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Goal Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Goal Distribution</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={getGoalDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getGoalDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Contribution Suggestions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Monthly Contribution Suggestions</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={goals.map(g => ({ name: g.name, amount: getMonthlyContributionSuggestion(g) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${value}`} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Add Goal Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                  <input
                    type="text"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (₹)</label>
                  <input
                    type="number"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount (₹)</label>
                  <input
                    type="number"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Goal
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

        {/* Goals List */}
        <div className="space-y-6">
          {goals.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No investment goals yet. Create your first goal to get started!</p>
            </div>
          ) : (
            getSortedGoals().map((goal) => {
              const categoryInfo = getCategoryInfo(goal.category);
              const daysRemaining = getDaysRemaining(goal.targetDate);
              const isCompleted = goal.progress >= 100;
              const priorityScore = getPriorityScore(goal);
              const monthlySuggestion = getMonthlyContributionSuggestion(goal);
              const isHighPriority = priorityScore >= 2;
              
              return (
                <div key={goal.id} className={`bg-white rounded-xl shadow-md p-6 ${isHighPriority ? 'ring-2 ring-orange-400' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{goal.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                          {categoryInfo.name}
                        </span>
                        {isHighPriority && (
                          <span className="flex items-center gap-1 text-orange-600 text-sm font-medium bg-orange-50 px-2 py-1 rounded">
                            <Star className="w-4 h-4" />
                            High Priority
                          </span>
                        )}
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Target: {formatDate(goal.targetDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <span>{daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Overdue'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingGoal(goal.id)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-gray-900">{goal.progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isCompleted ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Current Amount</p>
                      <p className="text-2xl font-bold text-gray-900">₹{goal.currentAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Target Amount</p>
                      <p className="text-2xl font-bold text-gray-900">₹{goal.targetAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Monthly Suggestion */}
                  {!isCompleted && monthlySuggestion > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Monthly Contribution Suggestion</p>
                          <p className="text-lg font-bold text-blue-700">₹{monthlySuggestion.toLocaleString()}/month</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Edit Form */}
                  {editingGoal === goal.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Update Current Amount</label>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          defaultValue={goal.currentAmount}
                          id={`edit-amount-${goal.id}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(`edit-amount-${goal.id}`);
                            handleUpdateGoal(goal.id, input.value);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setEditingGoal(null)}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;
