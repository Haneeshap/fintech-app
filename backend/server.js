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

// Mock user data
let users = [];
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
