import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PieChart, BarChart3, Shield, AlertTriangle, CheckCircle, Target, Layers, Globe } from 'lucide-react';
import axios from 'axios';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const Diversification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
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
      const [portfolioRes, stocksRes, fundsRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/portfolio/${user.id}`),
        axios.get('http://localhost:5001/api/stocks'),
        axios.get('http://localhost:5001/api/mutual-funds')
      ]);
      setPortfolio(portfolioRes.data);
      setStocks(stocksRes.data);
      setMutualFunds(fundsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiversificationMetrics = () => {
    if (!portfolio?.holdings?.length) {
      return {
        diversificationScore: 0,
        concentrationRisk: 'High',
        sectorExposure: [],
        geographicExposure: [],
        assetClassDistribution: [],
        recommendations: []
      };
    }

    const totalValue = portfolio.totalValue || 0;
    const holdingsCount = portfolio.holdings.length;
    
    // Calculate concentration risk
    const maxHoldingValue = Math.max(...portfolio.holdings.map(h => h.quantity * h.avgPrice));
    const concentrationRatio = (maxHoldingValue / totalValue) * 100;
    
    let concentrationRisk = 'Low';
    if (concentrationRatio > 40) concentrationRisk = 'High';
    else if (concentrationRatio > 25) concentrationRisk = 'Medium';
    
    // Calculate diversification score (0-100)
    const diversificationScore = Math.min(100, (holdingsCount * 10) + (100 - concentrationRatio * 1.5));
    
    // Asset class distribution
    const stockValue = portfolio.holdings
      .filter(h => h.type === 'stock')
      .reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
    const fundValue = portfolio.holdings
      .filter(h => h.type === 'mutual_fund')
      .reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
    
    const assetClassDistribution = [
      { name: 'Stocks', value: stockValue, percentage: (stockValue / totalValue) * 100 },
      { name: 'Mutual Funds', value: fundValue, percentage: (fundValue / totalValue) * 100 }
    ];
    
    // Simulated sector exposure (in real app, this would come from API)
    const sectorExposure = [
      { sector: 'Technology', percentage: Math.random() * 30 + 10 },
      { sector: 'Banking', percentage: Math.random() * 25 + 5 },
      { sector: 'Healthcare', percentage: Math.random() * 20 + 5 },
      { sector: 'Energy', percentage: Math.random() * 15 + 5 },
      { sector: 'Consumer', percentage: Math.random() * 20 + 5 },
      { sector: 'Infrastructure', percentage: Math.random() * 15 + 5 }
    ].sort((a, b) => b.percentage - a.percentage);
    
    // Simulated geographic exposure
    const geographicExposure = [
      { region: 'India', percentage: 70 + Math.random() * 15 },
      { region: 'USA', percentage: Math.random() * 10 + 5 },
      { region: 'Europe', percentage: Math.random() * 8 + 2 },
      { region: 'Asia', percentage: Math.random() * 7 + 3 },
      { region: 'Others', percentage: Math.random() * 5 }
    ];
    
    // Generate recommendations
    const recommendations = [];
    if (concentrationRisk === 'High') {
      recommendations.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'High Concentration Risk',
        description: 'Consider diversifying by reducing exposure to your largest holding below 25% of portfolio.'
      });
    }
    if (stockValue / totalValue > 80) {
      recommendations.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Overexposed to Stocks',
        description: 'Consider adding mutual funds or other asset classes to reduce volatility.'
      });
    }
    if (holdingsCount < 5) {
      recommendations.push({
        type: 'info',
        icon: Target,
        title: 'Limited Diversification',
        description: 'Consider adding more holdings to improve diversification and reduce risk.'
      });
    }
    if (diversificationScore > 70) {
      recommendations.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Well Diversified',
        description: 'Your portfolio shows good diversification across different assets and sectors.'
      });
    }
    
    return {
      diversificationScore: Math.round(diversificationScore),
      concentrationRisk,
      sectorExposure,
      geographicExposure,
      assetClassDistribution,
      recommendations
    };
  };

  const metrics = calculateDiversificationMetrics();

  const radarData = [
    { subject: 'Diversification', A: metrics.diversificationScore, fullMark: 100 },
    { subject: 'Concentration', A: 100 - (metrics.concentrationRisk === 'High' ? 80 : metrics.concentrationRisk === 'Medium' ? 50 : 20), fullMark: 100 },
    { subject: 'Sector Balance', A: 70 + Math.random() * 20, fullMark: 100 },
    { subject: 'Geographic', A: 60 + Math.random() * 25, fullMark: 100 },
    { subject: 'Asset Class', A: 75 + Math.random() * 20, fullMark: 100 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading diversification analysis...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Diversification Analysis</h1>
          <p className="text-gray-600 mt-2">Analyze your portfolio's risk exposure and diversification</p>
        </div>

        {!portfolio?.holdings?.length ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No holdings to analyze</h3>
            <p className="text-gray-500 mb-6">Start investing to use diversification analysis</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-500/30"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/30 p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-8 h-8" />
                    <span className="text-xl font-medium">Diversification Score</span>
                  </div>
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-6xl font-bold">{metrics.diversificationScore}</span>
                    <span className="text-2xl text-blue-100">/ 100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {metrics.diversificationScore >= 70 ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Well Diversified</span>
                      </>
                    ) : metrics.diversificationScore >= 50 ? (
                      <>
                        <Target className="w-5 h-5" />
                        <span className="font-semibold">Moderately Diversified</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-semibold">Needs Improvement</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Shield className="w-16 h-16" />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Concentration Risk</p>
                    <p className={`text-2xl font-bold ${metrics.concentrationRisk === 'High' ? 'text-red-600' : metrics.concentrationRisk === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {metrics.concentrationRisk}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {metrics.concentrationRisk === 'High' ? 'High exposure to single asset' : 'Balanced portfolio distribution'}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Holdings</p>
                    <p className="text-2xl font-bold text-gray-900">{portfolio.holdings.length}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {portfolio.holdings.length >= 5 ? 'Good diversification' : 'Consider adding more holdings'}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Asset Classes</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.assetClassDistribution.length}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {metrics.assetClassDistribution.length >= 2 ? 'Multi-asset portfolio' : 'Single asset class'}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Asset Class Distribution</h2>
                    <p className="text-sm text-gray-500">Portfolio allocation by asset type</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={metrics.assetClassDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {metrics.assetClassDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Sector Exposure</h2>
                    <p className="text-sm text-gray-500">Industry sector allocation</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={metrics.sectorExposure}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="sector" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => `${value.toFixed(1)}%`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="percentage" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Geographic Exposure</h2>
                    <p className="text-sm text-gray-500">Regional allocation</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={metrics.geographicExposure}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {metrics.geographicExposure.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Risk Radar</h2>
                    <p className="text-sm text-gray-500">Multi-dimensional risk analysis</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" stroke="#6b7280" />
                    <PolarRadiusAxis stroke="#6b7280" angle={90} domain={[0, 100]} />
                    <Radar name="Score" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Recommendations</h2>
                  <p className="text-sm text-gray-500">Personalized suggestions to improve diversification</p>
                </div>
              </div>

              {metrics.recommendations.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center gap-4">
                  <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900">Portfolio is well diversified</h3>
                    <p className="text-sm text-green-700">Your portfolio shows excellent diversification across multiple dimensions.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {metrics.recommendations.map((rec, index) => (
                    <div key={index} className={`border rounded-xl p-6 flex items-start gap-4 ${
                      rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 
                      rec.type === 'success' ? 'bg-green-50 border-green-200' : 
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        rec.type === 'warning' ? 'bg-yellow-100' : 
                        rec.type === 'success' ? 'bg-green-100' : 
                        'bg-blue-100'
                      }`}>
                        <rec.icon className={`w-6 h-6 ${
                          rec.type === 'warning' ? 'text-yellow-600' : 
                          rec.type === 'success' ? 'text-green-600' : 
                          'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${
                          rec.type === 'warning' ? 'text-yellow-900' : 
                          rec.type === 'success' ? 'text-green-900' : 
                          'text-blue-900'
                        }`}>
                          {rec.title}
                        </h3>
                        <p className={`text-sm ${
                          rec.type === 'warning' ? 'text-yellow-700' : 
                          rec.type === 'success' ? 'text-green-700' : 
                          'text-blue-700'
                        }`}>
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                onClick={() => navigate('/rebalancing')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg shadow-blue-500/30 font-medium"
              >
                Rebalance Portfolio
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Diversification;
