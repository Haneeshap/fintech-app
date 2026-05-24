import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, PlayCircle, CheckCircle, Clock, TrendingUp, Shield, Target, Award, Search, Filter } from 'lucide-react';

const LearningCenter = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedLessons, setCompletedLessons] = useState([1, 3, 5]);

  const categories = [
    { id: 'all', name: 'All Courses', icon: BookOpen },
    { id: 'basics', name: 'Investment Basics', icon: BookOpen },
    { id: 'stocks', name: 'Stock Market', icon: TrendingUp },
    { id: 'mutual-funds', name: 'Mutual Funds', icon: Shield },
    { id: 'risk', name: 'Risk Management', icon: Target },
    { id: 'advanced', name: 'Advanced Strategies', icon: Award },
  ];

  const courses = [
    {
      id: 1,
      title: 'Introduction to Investing',
      category: 'basics',
      duration: '15 min',
      level: 'Beginner',
      lessons: 5,
      completedLessons: 5,
      description: 'Learn the fundamentals of investing and how to get started with your investment journey.',
      thumbnail: 'bg-gradient-to-br from-blue-400 to-blue-600'
    },
    {
      id: 2,
      title: 'Understanding Stock Market',
      category: 'stocks',
      duration: '25 min',
      level: 'Beginner',
      lessons: 8,
      completedLessons: 3,
      description: 'Deep dive into how stock markets work, key concepts, and trading mechanisms.',
      thumbnail: 'bg-gradient-to-br from-green-400 to-green-600'
    },
    {
      id: 3,
      title: 'Mutual Fund Fundamentals',
      category: 'mutual-funds',
      duration: '20 min',
      level: 'Beginner',
      lessons: 6,
      completedLessons: 6,
      description: 'Everything you need to know about mutual funds, types, and how to invest.',
      thumbnail: 'bg-gradient-to-br from-purple-400 to-purple-600'
    },
    {
      id: 4,
      title: 'Risk Management Strategies',
      category: 'risk',
      duration: '30 min',
      level: 'Intermediate',
      lessons: 7,
      completedLessons: 2,
      description: 'Learn how to manage and mitigate investment risks effectively.',
      thumbnail: 'bg-gradient-to-br from-red-400 to-red-600'
    },
    {
      id: 5,
      title: 'Diversification Techniques',
      category: 'risk',
      duration: '18 min',
      level: 'Intermediate',
      lessons: 5,
      completedLessons: 5,
      description: 'Master the art of portfolio diversification to reduce risk.',
      thumbnail: 'bg-gradient-to-br from-amber-400 to-amber-600'
    },
    {
      id: 6,
      title: 'Technical Analysis Basics',
      category: 'advanced',
      duration: '35 min',
      level: 'Advanced',
      lessons: 10,
      completedLessons: 0,
      description: 'Introduction to technical analysis, charts, and indicators.',
      thumbnail: 'bg-gradient-to-br from-pink-400 to-pink-600'
    },
    {
      id: 7,
      title: 'SIP Investment Guide',
      category: 'mutual-funds',
      duration: '22 min',
      level: 'Beginner',
      lessons: 6,
      completedLessons: 0,
      description: 'Complete guide to Systematic Investment Plans and their benefits.',
      thumbnail: 'bg-gradient-to-br from-cyan-400 to-cyan-600'
    },
    {
      id: 8,
      title: 'Portfolio Rebalancing',
      category: 'advanced',
      duration: '28 min',
      level: 'Advanced',
      lessons: 8,
      completedLessons: 0,
      description: 'Learn when and how to rebalance your portfolio for optimal returns.',
      thumbnail: 'bg-gradient-to-br from-indigo-400 to-indigo-600'
    },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getProgress = (completed, total) => (completed / total) * 100;

  const isCompleted = (courseId) => completedLessons.includes(courseId);

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
          <h1 className="text-3xl font-bold text-gray-900">Learning Center</h1>
          <p className="text-gray-600 mt-2">Enhance your investment knowledge with our educational courses</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/30 p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6" />
                <span className="text-lg font-medium">Your Learning Progress</span>
              </div>
              <p className="text-4xl font-bold mb-2">
                {completedLessons.length} / {courses.length} Courses Completed
              </p>
              <p className="text-blue-100">
                {Math.round((completedLessons.length / courses.length) * 100)}% of courses completed
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-16 h-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`${course.thumbnail} h-40 flex items-center justify-center`}>
                <PlayCircle className="w-16 h-16 text-white/80" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{course.level}</span>
                  {isCompleted(course.id) && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Completed</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.lessons} lessons
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{getProgress(course.completedLessons, course.lessons).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                      style={{ width: `${getProgress(course.completedLessons, course.lessons)}%` }}
                    />
                  </div>
                </div>

                <button
                  className={`w-full py-3 rounded-xl font-medium transition ${
                    isCompleted(course.id)
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30'
                  }`}
                >
                  {isCompleted(course.id) ? 'Review Course' : 'Continue Learning'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Quick Tips Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quick Investment Tips</h2>
              <p className="text-sm text-gray-500">Essential knowledge for smart investing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Start Early</h3>
              <p className="text-sm text-blue-700">The power of compounding works best when you start investing early and stay invested for the long term.</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Diversify</h3>
              <p className="text-sm text-green-700">Don't put all your eggs in one basket. Spread your investments across different asset classes.</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">Stay Informed</h3>
              <p className="text-sm text-purple-700">Keep learning about market trends, economic indicators, and investment strategies.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearningCenter;
