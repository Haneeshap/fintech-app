import { useState, useEffect } from 'react';
import axios from 'axios';
import { Newspaper, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

const News = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Stocks', 'Economy', 'Technology', 'Mutual Funds', 'Policy'];

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, news]);

  const fetchNews = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/news');
      setNews(response.data);
      setFilteredNews(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Stocks':
        return <TrendingUp className="w-5 h-5" />;
      case 'Economy':
        return <DollarSign className="w-5 h-5" />;
      case 'Technology':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Newspaper className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Stocks':
        return 'bg-blue-100 text-blue-800';
      case 'Economy':
        return 'bg-green-100 text-green-800';
      case 'Technology':
        return 'bg-purple-100 text-purple-800';
      case 'Mutual Funds':
        return 'bg-orange-100 text-orange-800';
      case 'Policy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading market news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Market News</h1>
          <p className="text-gray-600">Stay updated with the latest market developments</p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {getCategoryIcon(item.category)}
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500">{formatTime(item.timestamp)}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {item.summary}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No news found for this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
