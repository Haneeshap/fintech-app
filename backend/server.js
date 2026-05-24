import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for stocks and mutual funds
const stocks = [
  { id: 1, symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.80, change: 2.34, type: 'stock' },
  { id: 2, symbol: 'TCS', name: 'Tata Consultancy Services', price: 3890.50, change: -0.89, type: 'stock' },
  { id: 3, symbol: 'INFY', name: 'Infosys', price: 1456.30, change: 1.23, type: 'stock' },
  { id: 4, symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1678.90, change: -0.45, type: 'stock' },
  { id: 5, symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1034.20, change: 0.78, type: 'stock' },
  { id: 6, symbol: 'SBIN', name: 'State Bank of India', price: 756.40, change: 1.56, type: 'stock' },
  { id: 7, symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1234.50, change: -1.23, type: 'stock' },
  { id: 8, symbol: 'ITC', name: 'ITC Limited', price: 445.60, change: 0.34, type: 'stock' },
];

const mutualFunds = [
  { id: 101, name: 'Axis Bluechip Fund', category: 'Large Cap', nav: 48.56, returns: { '1Y': 12.5, '3Y': 14.2, '5Y': 11.8 }, type: 'mutual_fund' },
  { id: 102, name: 'Mirae Asset Large Cap Fund', category: 'Large Cap', nav: 52.34, returns: { '1Y': 11.8, '3Y': 13.5, '5Y': 12.1 }, type: 'mutual_fund' },
  { id: 103, name: 'SBI Small Cap Fund', category: 'Small Cap', nav: 98.45, returns: { '1Y': 18.2, '3Y': 22.1, '5Y': 19.5 }, type: 'mutual_fund' },
  { id: 104, name: 'HDFC Mid-Cap Opportunities', category: 'Mid Cap', nav: 76.23, returns: { '1Y': 15.6, '3Y': 17.8, '5Y': 14.9 }, type: 'mutual_fund' },
  { id: 105, name: 'Kotak Emerging Equity', category: 'Mid Cap', nav: 65.89, returns: { '1Y': 14.2, '3Y': 16.5, '5Y': 13.8 }, type: 'mutual_fund' },
];

// Market news data
const marketNews = [
  { id: 1, title: 'Reliance Industries hits record high on strong Q4 earnings', category: 'Stocks', timestamp: new Date(Date.now() - 3600000).toISOString(), summary: 'Reliance Industries surged 3.5% after reporting better-than-expected quarterly results driven by retail and telecom segments.' },
  { id: 2, title: 'RBI maintains repo rate at 6.5%, focuses on inflation', category: 'Economy', timestamp: new Date(Date.now() - 7200000).toISOString(), summary: 'The Reserve Bank of India kept the key interest rate unchanged, signaling continued focus on bringing down inflation to target levels.' },
  { id: 3, title: 'IT sector faces headwinds amid global slowdown concerns', category: 'Technology', timestamp: new Date(Date.now() - 10800000).toISOString(), summary: 'Major IT stocks declined as investors worry about reduced IT spending by clients in the US and Europe due to economic uncertainties.' },
  { id: 4, title: 'Small cap funds outperform large caps in Q1', category: 'Mutual Funds', timestamp: new Date(Date.now() - 14400000).toISOString(), summary: 'Small cap mutual funds delivered 18% returns in the first quarter, outperforming large cap funds which returned 12%.' },
  { id: 5, title: 'Government announces new manufacturing incentives', category: 'Policy', timestamp: new Date(Date.now() - 18000000).toISOString(), summary: 'The government unveiled a production-linked incentive scheme for electronics manufacturing, expected to boost domestic production.' },
];

// Market indices data
const marketIndices = [
  { id: 1, name: 'NIFTY 50', value: 22456.80, change: 125.30, changePercent: 0.56, high: 22500.00, low: 22300.00 },
  { id: 2, name: 'SENSEX', value: 74234.50, change: 423.20, changePercent: 0.57, high: 74500.00, low: 73800.00 },
  { id: 3, name: 'NIFTY BANK', value: 47890.30, change: 234.50, changePercent: 0.49, high: 48000.00, low: 47600.00 },
  { id: 4, name: 'NIFTY IT', value: 34567.80, change: -123.40, changePercent: -0.36, high: 34800.00, low: 34400.00 },
];

// Dividend data
const dividends = [
  { id: 1, stockId: 1, amount: 28, frequency: 'annual', exDate: '2024-06-15', recordDate: '2024-06-17', payoutDate: '2024-07-10' },
  { id: 2, stockId: 2, amount: 24, frequency: 'annual', exDate: '2024-05-20', recordDate: '2024-05-22', payoutDate: '2024-06-15' },
  { id: 3, stockId: 4, amount: 16, frequency: 'semi-annual', exDate: '2024-04-10', recordDate: '2024-04-12', payoutDate: '2024-05-05' },
  { id: 4, stockId: 5, amount: 8, frequency: 'quarterly', exDate: '2024-03-15', recordDate: '2024-03-17', payoutDate: '2024-04-10' },
  { id: 5, stockId: 6, amount: 12, frequency: 'annual', exDate: '2024-02-20', recordDate: '2024-02-22', payoutDate: '2024-03-15' },
];

// User dividend tracking
let userDividends = [];

// Goal-based investing data
let investmentGoals = [];

// Risk assessment data
let riskProfiles = [];

// Mock user data
let users = [
  { id: 1, email: 'user@example.com', password: 'password123', name: 'Test User' },
  { id: 2, email: 'admin@example.com', password: 'admin123', name: 'Admin User' }
];
let portfolios = [];
let watchlists = [];
let transactions = [];

// Routes
app.get('/api/stocks', (req, res) => {
  res.json(stocks);
});

app.get('/api/stocks/:id', (req, res) => {
  const stock = stocks.find(s => s.id === parseInt(req.params.id));
  if (stock) {
    res.json(stock);
  } else {
    res.status(404).json({ error: 'Stock not found' });
  }
});

app.get('/api/mutual-funds', (req, res) => {
  res.json(mutualFunds);
});

app.get('/api/mutual-funds/:id', (req, res) => {
  const fund = mutualFunds.find(f => f.id === parseInt(req.params.id));
  if (fund) {
    res.json(fund);
  } else {
    res.status(404).json({ error: 'Mutual fund not found' });
  }
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const user = { id: users.length + 1, email, password, name };
  users.push(user);
  res.json({ message: 'User created successfully', user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.name } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/portfolio/:userId', (req, res) => {
  const portfolio = portfolios.find(p => p.userId === parseInt(req.params.userId));
  if (portfolio) {
    res.json(portfolio);
  } else {
    res.json({ userId: parseInt(req.params.userId), holdings: [], totalValue: 0 });
  }
});

app.post('/api/portfolio/:userId/buy', (req, res) => {
  const { userId } = req.params;
  const { type, itemId, quantity, price } = req.body;
  
  let portfolio = portfolios.find(p => p.userId === parseInt(userId));
  if (!portfolio) {
    portfolio = { userId: parseInt(userId), holdings: [], totalValue: 0 };
    portfolios.push(portfolio);
  }
  
  const existingHolding = portfolio.holdings.find(h => h.itemId === itemId);
  if (existingHolding) {
    existingHolding.quantity += quantity;
    existingHolding.avgPrice = ((existingHolding.avgPrice * existingHolding.quantity) + (price * quantity)) / (existingHolding.quantity + quantity);
  } else {
    portfolio.holdings.push({ type, itemId, quantity, avgPrice: price });
  }
  
  portfolio.totalValue = portfolio.holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
  
  // Log transaction
  const itemName = type === 'stock' 
    ? stocks.find(s => s.id === itemId)?.name 
    : mutualFunds.find(f => f.id === itemId)?.name;
  transactions.push({
    id: transactions.length + 1,
    userId: parseInt(userId),
    type: 'buy',
    itemType: type,
    itemId,
    itemName,
    quantity,
    price,
    total: quantity * price,
    date: new Date().toISOString()
  });
  
  res.json(portfolio);
});

app.post('/api/portfolio/:userId/sell', (req, res) => {
  const { userId } = req.params;
  const { itemId, quantity } = req.body;
  
  const portfolio = portfolios.find(p => p.userId === parseInt(userId));
  if (!portfolio) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }
  
  const holding = portfolio.holdings.find(h => h.itemId === itemId);
  if (!holding) {
    return res.status(404).json({ error: 'Holding not found' });
  }
  
  if (holding.quantity < quantity) {
    return res.status(400).json({ error: 'Insufficient quantity' });
  }
  
  holding.quantity -= quantity;
  if (holding.quantity === 0) {
    portfolio.holdings = portfolio.holdings.filter(h => h.itemId !== itemId);
  }
  
  portfolio.totalValue = portfolio.holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
  
  // Log transaction
  const itemName = holding.type === 'stock' 
    ? stocks.find(s => s.id === itemId)?.name 
    : mutualFunds.find(f => f.id === itemId)?.name;
  transactions.push({
    id: transactions.length + 1,
    userId: parseInt(userId),
    type: 'sell',
    itemType: holding.type,
    itemId,
    itemName,
    quantity,
    price: holding.avgPrice,
    total: quantity * holding.avgPrice,
    date: new Date().toISOString()
  });
  
  res.json(portfolio);
});

app.get('/api/watchlist/:userId', (req, res) => {
  const watchlist = watchlists.find(w => w.userId === parseInt(req.params.userId));
  if (watchlist) {
    res.json(watchlist);
  } else {
    res.json({ userId: parseInt(req.params.userId), items: [] });
  }
});

app.post('/api/watchlist/:userId/add', (req, res) => {
  const { userId } = req.params;
  const { type, itemId } = req.body;
  
  let watchlist = watchlists.find(w => w.userId === parseInt(userId));
  if (!watchlist) {
    watchlist = { userId: parseInt(userId), items: [] };
    watchlists.push(watchlist);
  }
  
  if (!watchlist.items.find(i => i.itemId === itemId)) {
    watchlist.items.push({ type, itemId });
  }
  
  res.json(watchlist);
});

app.delete('/api/watchlist/:userId/remove/:itemId', (req, res) => {
  const { userId, itemId } = req.params;
  
  const watchlist = watchlists.find(w => w.userId === parseInt(userId));
  if (!watchlist) {
    return res.status(404).json({ error: 'Watchlist not found' });
  }
  
  watchlist.items = watchlist.items.filter(i => i.itemId !== parseInt(itemId));
  res.json(watchlist);
});

app.get('/api/transactions/:userId', (req, res) => {
  const userTransactions = transactions.filter(t => t.userId === parseInt(req.params.userId));
  res.json(userTransactions.reverse());
});

// Market news endpoints
app.get('/api/news', (req, res) => {
  const { category } = req.query;
  if (category) {
    const filteredNews = marketNews.filter(n => n.category.toLowerCase() === category.toLowerCase());
    res.json(filteredNews);
  } else {
    res.json(marketNews);
  }
});

app.get('/api/news/:id', (req, res) => {
  const newsItem = marketNews.find(n => n.id === parseInt(req.params.id));
  if (newsItem) {
    res.json(newsItem);
  } else {
    res.status(404).json({ error: 'News item not found' });
  }
});

// Market indices endpoints
app.get('/api/indices', (req, res) => {
  res.json(marketIndices);
});

app.get('/api/indices/:id', (req, res) => {
  const index = marketIndices.find(i => i.id === parseInt(req.params.id));
  if (index) {
    res.json(index);
  } else {
    res.status(404).json({ error: 'Index not found' });
  }
});

// Stock comparison endpoint
app.post('/api/compare', (req, res) => {
  const { items } = req.body;
  const comparisonData = items.map(itemId => {
    const stock = stocks.find(s => s.id === itemId);
    const fund = mutualFunds.find(f => f.id === itemId);
    return stock || fund || null;
  }).filter(item => item !== null);
  res.json(comparisonData);
});

// Price alerts (mock implementation)
let priceAlerts = [];

app.get('/api/alerts/:userId', (req, res) => {
  const userAlerts = priceAlerts.filter(a => a.userId === parseInt(req.params.userId));
  res.json(userAlerts);
});

app.post('/api/alerts/:userId/add', (req, res) => {
  const { userId } = req.params;
  const { type, itemId, targetPrice, condition } = req.body;
  
  const itemName = type === 'stock' 
    ? stocks.find(s => s.id === itemId)?.name 
    : mutualFunds.find(f => f.id === itemId)?.name;
  
  const alert = {
    id: priceAlerts.length + 1,
    userId: parseInt(userId),
    type,
    itemId,
    itemName,
    targetPrice,
    condition, // 'above' or 'below'
    currentPrice: type === 'stock' 
      ? stocks.find(s => s.id === itemId)?.price 
      : mutualFunds.find(f => f.id === itemId)?.nav,
    triggered: false,
    createdAt: new Date().toISOString()
  };
  
  priceAlerts.push(alert);
  res.json(alert);
});

app.delete('/api/alerts/:userId/remove/:alertId', (req, res) => {
  const { userId, alertId } = req.params;
  priceAlerts = priceAlerts.filter(a => !(a.userId === parseInt(userId) && a.id === parseInt(alertId)));
  res.json({ message: 'Alert removed successfully' });
});

// Stock screener endpoint
app.get('/api/screener', (req, res) => {
  const { minPrice, maxPrice, minChange, maxChange, type } = req.query;
  
  let filteredStocks = [...stocks];
  let filteredFunds = [...mutualFunds];
  
  if (minPrice) {
    filteredStocks = filteredStocks.filter(s => s.price >= parseFloat(minPrice));
    filteredFunds = filteredFunds.filter(f => f.nav >= parseFloat(minPrice));
  }
  
  if (maxPrice) {
    filteredStocks = filteredStocks.filter(s => s.price <= parseFloat(maxPrice));
    filteredFunds = filteredFunds.filter(f => f.nav <= parseFloat(maxPrice));
  }
  
  if (minChange) {
    filteredStocks = filteredStocks.filter(s => s.change >= parseFloat(minChange));
  }
  
  if (maxChange) {
    filteredStocks = filteredStocks.filter(s => s.change <= parseFloat(maxChange));
  }
  
  if (type === 'stock') {
    return res.json(filteredStocks);
  } else if (type === 'mutual_fund') {
    return res.json(filteredFunds);
  }
  
  res.json({
    stocks: filteredStocks,
    mutualFunds: filteredFunds
  });
});

// Dividend endpoints
app.get('/api/dividends', (req, res) => {
  const enrichedDividends = dividends.map(div => {
    const stock = stocks.find(s => s.id === div.stockId);
    return {
      ...div,
      stockName: stock?.name,
      stockSymbol: stock?.symbol
    };
  });
  res.json(enrichedDividends);
});

app.get('/api/dividends/:userId', (req, res) => {
  const userDividendData = userDividends.filter(d => d.userId === parseInt(req.params.userId));
  const enrichedData = userDividendData.map(div => {
    const stock = stocks.find(s => s.id === div.stockId);
    return {
      ...div,
      stockName: stock?.name,
      stockSymbol: stock?.symbol
    };
  });
  res.json(enrichedData);
});

app.post('/api/dividends/:userId/track', (req, res) => {
  const { userId } = req.params;
  const { stockId } = req.body;
  
  const dividend = dividends.find(d => d.stockId === parseInt(stockId));
  if (!dividend) {
    return res.status(404).json({ error: 'Dividend data not found for this stock' });
  }
  
  const existingTracking = userDividends.find(d => d.userId === parseInt(userId) && d.stockId === parseInt(stockId));
  if (existingTracking) {
    return res.status(400).json({ error: 'Already tracking this stock dividend' });
  }
  
  const tracking = {
    id: userDividends.length + 1,
    userId: parseInt(userId),
    stockId: parseInt(stockId),
    ...dividend,
    trackedAt: new Date().toISOString()
  };
  
  userDividends.push(tracking);
  res.json(tracking);
});

app.delete('/api/dividends/:userId/untrack/:stockId', (req, res) => {
  const { userId, stockId } = req.params;
  userDividends = userDividends.filter(d => !(d.userId === parseInt(userId) && d.stockId === parseInt(stockId)));
  res.json({ message: 'Dividend tracking removed' });
});

// Investment goals endpoints
app.get('/api/goals/:userId', (req, res) => {
  const userGoals = investmentGoals.filter(g => g.userId === parseInt(req.params.userId));
  res.json(userGoals);
});

app.post('/api/goals/:userId/add', (req, res) => {
  const { userId } = req.params;
  const { name, targetAmount, currentAmount, targetDate, category } = req.body;
  
  const goal = {
    id: investmentGoals.length + 1,
    userId: parseInt(userId),
    name,
    targetAmount: parseFloat(targetAmount),
    currentAmount: parseFloat(currentAmount) || 0,
    targetDate,
    category,
    progress: (parseFloat(currentAmount) || 0) / parseFloat(targetAmount) * 100,
    createdAt: new Date().toISOString()
  };
  
  investmentGoals.push(goal);
  res.json(goal);
});

app.put('/api/goals/:userId/update/:goalId', (req, res) => {
  const { userId, goalId } = req.params;
  const { currentAmount } = req.body;
  
  const goal = investmentGoals.find(g => g.userId === parseInt(userId) && g.id === parseInt(goalId));
  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' });
  }
  
  goal.currentAmount = parseFloat(currentAmount);
  goal.progress = (goal.currentAmount / goal.targetAmount) * 100;
  
  res.json(goal);
});

app.delete('/api/goals/:userId/remove/:goalId', (req, res) => {
  const { userId, goalId } = req.params;
  investmentGoals = investmentGoals.filter(g => !(g.userId === parseInt(userId) && g.id === parseInt(goalId)));
  res.json({ message: 'Goal removed successfully' });
});

// Risk assessment endpoints
app.get('/api/risk-profile/:userId', (req, res) => {
  const userProfile = riskProfiles.find(r => r.userId === parseInt(req.params.userId));
  if (userProfile) {
    res.json(userProfile);
  } else {
    res.json({ userId: parseInt(req.params.userId), riskLevel: null, score: 0 });
  }
});

app.post('/api/risk-profile/:userId/assess', (req, res) => {
  const { userId } = req.params;
  const { answers } = req.body;
  
  // Calculate risk score based on answers
  // Each answer is weighted (1-5 scale)
  let totalScore = 0;
  const maxScore = answers.length * 5;
  
  answers.forEach(answer => {
    totalScore += answer;
  });
  
  const percentage = (totalScore / maxScore) * 100;
  
  let riskLevel;
  if (percentage < 30) {
    riskLevel = 'Conservative';
  } else if (percentage < 50) {
    riskLevel = 'Moderately Conservative';
  } else if (percentage < 70) {
    riskLevel = 'Moderate';
  } else if (percentage < 85) {
    riskLevel = 'Moderately Aggressive';
  } else {
    riskLevel = 'Aggressive';
  }
  
  const profile = {
    id: riskProfiles.length + 1,
    userId: parseInt(userId),
    riskLevel,
    score: percentage,
    answers,
    assessedAt: new Date().toISOString()
  };
  
  // Update or create profile
  const existingIndex = riskProfiles.findIndex(r => r.userId === parseInt(userId));
  if (existingIndex !== -1) {
    riskProfiles[existingIndex] = profile;
  } else {
    riskProfiles.push(profile);
  }
  
  res.json(profile);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
