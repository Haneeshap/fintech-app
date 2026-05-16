import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Shield, CheckCircle, AlertTriangle, TrendingUp, Scale, Clock, Target } from 'lucide-react';

const RiskAssessment = () => {
  const { user } = useAuth();
  const [riskProfile, setRiskProfile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: 1,
      category: 'Investment Experience',
      question: 'How long have you been investing?',
      options: [
        { value: 1, label: 'Less than 1 year' },
        { value: 2, label: '1-3 years' },
        { value: 3, label: '3-5 years' },
        { value: 4, label: '5-10 years' },
        { value: 5, label: 'More than 10 years' }
      ]
    },
    {
      id: 2,
      category: 'Risk Tolerance',
      question: 'How would you react if your portfolio dropped 20% in a month?',
      options: [
        { value: 1, label: 'Sell everything to prevent further losses' },
        { value: 2, label: 'Sell some investments' },
        { value: 3, label: 'Hold and wait for recovery' },
        { value: 4, label: 'Buy more at lower prices' },
        { value: 5, label: 'Significantly increase investments' }
      ]
    },
    {
      id: 3,
      category: 'Time Horizon',
      question: 'When do you plan to use your invested money?',
      options: [
        { value: 1, label: 'Less than 1 year' },
        { value: 2, label: '1-3 years' },
        { value: 3, label: '3-5 years' },
        { value: 4, label: '5-10 years' },
        { value: 5, label: 'More than 10 years' }
      ]
    },
    {
      id: 4,
      category: 'Financial Stability',
      question: 'What percentage of your income can you invest without affecting your lifestyle?',
      options: [
        { value: 1, label: 'Less than 5%' },
        { value: 2, label: '5-10%' },
        { value: 3, label: '10-20%' },
        { value: 4, label: '20-30%' },
        { value: 5, label: 'More than 30%' }
      ]
    },
    {
      id: 5,
      category: 'Investment Knowledge',
      question: 'How would you rate your understanding of investment products?',
      options: [
        { value: 1, label: 'Very limited' },
        { value: 2, label: 'Basic understanding' },
        { value: 3, label: 'Moderate knowledge' },
        { value: 4, label: 'Good understanding' },
        { value: 5, label: 'Expert level' }
      ]
    },
    {
      id: 6,
      category: 'Risk Capacity',
      question: 'Are you comfortable with investments that may fluctuate significantly in value?',
      options: [
        { value: 1, label: 'Not at all comfortable' },
        { value: 2, label: 'Slightly uncomfortable' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Somewhat comfortable' },
        { value: 5, label: 'Very comfortable' }
      ]
    },
    {
      id: 7,
      category: 'Investment Goals',
      question: 'What is your primary investment objective?',
      options: [
        { value: 1, label: 'Capital preservation' },
        { value: 2, label: 'Income generation' },
        { value: 3, label: 'Balanced growth and income' },
        { value: 4, label: 'Capital appreciation' },
        { value: 5, label: 'Maximum growth' }
      ]
    },
    {
      id: 8,
      category: 'Emotional Stability',
      question: 'How often do you check your investment portfolio?',
      options: [
        { value: 1, label: 'Multiple times daily' },
        { value: 2, label: 'Daily' },
        { value: 3, label: 'Weekly' },
        { value: 4, label: 'Monthly' },
        { value: 5, label: 'Rarely or never' }
      ]
    }
  ];

  useEffect(() => {
    if (user) {
      fetchRiskProfile();
    }
  }, [user]);

  const fetchRiskProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/risk-profile/${user.id}`);
      setRiskProfile(response.data);
      if (response.data.riskLevel) {
        setAnswers(response.data.answers || []);
        setSubmitted(true);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching risk profile:', error);
      setLoading(false);
    }
  };

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`http://localhost:5001/api/risk-profile/${user.id}/assess`, {
        answers
      });
      setRiskProfile(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting risk assessment:', error);
    }
  };

  const handleRetake = () => {
    setAnswers([]);
    setCurrentStep(0);
    setSubmitted(false);
  };

  const getRiskLevelInfo = (riskLevel) => {
    switch (riskLevel) {
      case 'Conservative':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Shield className="w-6 h-6" />,
          description: 'You prefer stable investments with minimal risk. Focus on government bonds, fixed deposits, and large-cap stocks.',
          recommendedAllocation: { equity: 20, debt: 60, gold: 10, cash: 10 }
        };
      case 'Moderately Conservative':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <Shield className="w-6 h-6" />,
          description: 'You seek balance between safety and growth. Consider a mix of large-cap stocks, balanced mutual funds, and bonds.',
          recommendedAllocation: { equity: 35, debt: 45, gold: 10, cash: 10 }
        };
      case 'Moderate':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Scale className="w-6 h-6" />,
          description: 'You are comfortable with moderate risk for better returns. Diversify across equity, debt, and gold.',
          recommendedAllocation: { equity: 50, debt: 35, gold: 10, cash: 5 }
        };
      case 'Moderately Aggressive':
        return {
          color: 'bg-orange-100 text-orange-800',
          icon: <TrendingUp className="w-6 h-6" />,
          description: 'You can accept higher risk for potentially higher returns. Focus on growth stocks and equity mutual funds.',
          recommendedAllocation: { equity: 65, debt: 25, gold: 5, cash: 5 }
        };
      case 'Aggressive':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <AlertTriangle className="w-6 h-6" />,
          description: 'You seek maximum growth and can handle significant volatility. Consider small-cap stocks, sector funds, and international investments.',
          recommendedAllocation: { equity: 80, debt: 15, gold: 3, cash: 2 }
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading risk assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Assessment</h1>
          <p className="text-gray-600">Discover your investment risk profile</p>
        </div>

        {submitted && riskProfile?.riskLevel ? (
          <div className="space-y-6">
            {/* Result Card */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-lg font-bold mb-4 ${getRiskLevelInfo(riskProfile.riskLevel).color}`}>
                  {getRiskLevelInfo(riskProfile.riskLevel).icon}
                  {riskProfile.riskLevel}
                </div>
                <p className="text-gray-600">Your Risk Profile</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{riskProfile.score.toFixed(0)}/100</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Strategy</h3>
                <p className="text-gray-700">{getRiskLevelInfo(riskProfile.riskLevel).description}</p>
              </div>

              {/* Recommended Allocation */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Asset Allocation</h3>
                <div className="space-y-3">
                  {Object.entries(getRiskLevelInfo(riskProfile.riskLevel).recommendedAllocation).map(([asset, percentage]) => (
                    <div key={asset}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">{asset}</span>
                        <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleRetake}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retake Assessment
                </button>
              </div>
            </div>

            {/* Assessment Date */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>Last assessed: {new Date(riskProfile.assessedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Question {currentStep + 1} of {questions.length}</span>
                <span className="text-sm font-bold text-gray-900">{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                  {questions[currentStep].category}
                </span>
                <h2 className="text-2xl font-bold text-gray-900">{questions[currentStep].question}</h2>
              </div>

              <div className="space-y-3">
                {questions[currentStep].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[currentStep] === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentStep] === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentStep] === option.value && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-gray-900">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {currentStep === questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!answers[currentStep]}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Assessment
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!answers[currentStep]}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>

            {/* Question Navigation */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex flex-wrap gap-2 justify-center">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-10 h-10 rounded-full font-medium transition-all ${
                      index === currentStep
                        ? 'bg-blue-600 text-white'
                        : answers[index]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAssessment;
