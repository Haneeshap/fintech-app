import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator as CalculatorIcon, TrendingUp, DollarSign, PieChart, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Calculator = () => {
  const navigate = useNavigate();
  const [calculatorType, setCalculatorType] = useState('sip');
  const [sipAmount, setSipAmount] = useState(10000);
  const [sipYears, setSipYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [lumpsumAmount, setLumpsumAmount] = useState(100000);
  const [lumpsumYears, setLumpsumYears] = useState(10);
  const [lumpsumReturn, setLumpsumReturn] = useState(12);

  // SIP Calculation
  const calculateSIP = () => {
    const monthlyRate = expectedReturn / 12 / 100;
    const months = sipYears * 12;
    const futureValue = sipAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvestment = sipAmount * months;
    const returns = futureValue - totalInvestment;
    return { futureValue, totalInvestment, returns };
  };

  // Lumpsum Calculation
  const calculateLumpsum = () => {
    const annualRate = lumpsumReturn / 100;
    const futureValue = lumpsumAmount * Math.pow(1 + annualRate, lumpsumYears);
    const returns = futureValue - lumpsumAmount;
    return { futureValue, totalInvestment: lumpsumAmount, returns };
  };

  // Generate year-wise data for chart
  const generateSIPData = () => {
    const data = [];
    const monthlyRate = expectedReturn / 12 / 100;
    let currentValue = 0;
    let totalInvested = 0;

    for (let year = 1; year <= sipYears; year++) {
      for (let month = 1; month <= 12; month++) {
        currentValue += sipAmount;
        totalInvested += sipAmount;
        currentValue = currentValue * (1 + monthlyRate);
      }
      data.push({
        year: `Year ${year}`,
        invested: totalInvested,
        value: currentValue
      });
    }
    return data;
  };

  const generateLumpsumData = () => {
    const data = [];
    const annualRate = lumpsumReturn / 100;
    let currentValue = lumpsumAmount;

    for (let year = 1; year <= lumpsumYears; year++) {
      currentValue = currentValue * (1 + annualRate);
      data.push({
        year: `Year ${year}`,
        invested: lumpsumAmount,
        value: currentValue
      });
    }
    return data;
  };

  const sipResult = calculateSIP();
  const lumpsumResult = calculateLumpsum();
  const sipChartData = generateSIPData();
  const lumpsumChartData = generateLumpsumData();

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
          <h1 className="text-3xl font-bold text-gray-900">Investment Calculator</h1>
          <p className="text-gray-600 mt-2">Plan your investments and visualize potential returns</p>
        </div>

        {/* Calculator Type Toggle */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-8 inline-flex">
          <button
            onClick={() => setCalculatorType('sip')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              calculatorType === 'sip'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            SIP Calculator
          </button>
          <button
            onClick={() => setCalculatorType('lumpsum')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              calculatorType === 'lumpsum'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Lumpsum Calculator
          </button>
        </div>

        {calculatorType === 'sip' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <CalculatorIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">SIP Calculator</h2>
                  <p className="text-sm text-gray-500">Systematic Investment Plan</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Investment Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      value={sipAmount}
                      onChange={(e) => setSipAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      min="500"
                      max="1000000"
                    />
                  </div>
                  <input
                    type="range"
                    value={sipAmount}
                    onChange={(e) => setSipAmount(Number(e.target.value))}
                    min="500"
                    max="1000000"
                    step="500"
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Period: {sipYears} years
                  </label>
                  <input
                    type="range"
                    value={sipYears}
                    onChange={(e) => setSipYears(Number(e.target.value))}
                    min="1"
                    max="30"
                    step="1"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1 year</span>
                    <span>30 years</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Annual Return: {expectedReturn}%
                  </label>
                  <input
                    type="range"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    min="5"
                    max="25"
                    step="0.5"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>5%</span>
                    <span>25%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6" />
                  <span className="font-medium">Projected Value</span>
                </div>
                <p className="text-4xl font-bold">₹{sipResult.futureValue.toFixed(2).toLocaleString('en-IN')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Total Investment</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">₹{sipResult.totalInvestment.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Est. Returns</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{sipResult.returns.toFixed(2).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Growth Chart</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={sipChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => `₹${value.toFixed(0).toLocaleString('en-IN')}`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area type="monotone" dataKey="invested" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} name="Invested" />
                    <Area type="monotone" dataKey="value" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Value" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  SIP helps in rupee cost averaging and power of compounding. Returns shown are estimated and not guaranteed.
                </p>
              </div>
            </div>
          </div>
        )}

        {calculatorType === 'lumpsum' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <CalculatorIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Lumpsum Calculator</h2>
                  <p className="text-sm text-gray-500">One-time Investment</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      value={lumpsumAmount}
                      onChange={(e) => setLumpsumAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                      min="1000"
                      max="10000000"
                    />
                  </div>
                  <input
                    type="range"
                    value={lumpsumAmount}
                    onChange={(e) => setLumpsumAmount(Number(e.target.value))}
                    min="1000"
                    max="10000000"
                    step="1000"
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Period: {lumpsumYears} years
                  </label>
                  <input
                    type="range"
                    value={lumpsumYears}
                    onChange={(e) => setLumpsumYears(Number(e.target.value))}
                    min="1"
                    max="30"
                    step="1"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1 year</span>
                    <span>30 years</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Annual Return: {lumpsumReturn}%
                  </label>
                  <input
                    type="range"
                    value={lumpsumReturn}
                    onChange={(e) => setLumpsumReturn(Number(e.target.value))}
                    min="5"
                    max="25"
                    step="0.5"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>5%</span>
                    <span>25%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/30 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6" />
                  <span className="font-medium">Projected Value</span>
                </div>
                <p className="text-4xl font-bold">₹{lumpsumResult.futureValue.toFixed(2).toLocaleString('en-IN')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Investment</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">₹{lumpsumResult.totalInvestment.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Est. Returns</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{lumpsumResult.returns.toFixed(2).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Growth Chart</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={lumpsumChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => `₹${value.toFixed(0).toLocaleString('en-IN')}`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area type="monotone" dataKey="invested" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} name="Invested" />
                    <Area type="monotone" dataKey="value" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Value" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-purple-800">
                  Lumpsum investments benefit from longer compounding periods. Returns shown are estimated and not guaranteed.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Calculator;
