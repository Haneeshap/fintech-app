import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Buy from './pages/Buy';
import Sell from './pages/Sell';
import TransactionHistory from './pages/TransactionHistory';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import KYC from './pages/KYC';
import SIP from './pages/SIP';
import News from './pages/News';
import MarketIndices from './pages/MarketIndices';
import Compare from './pages/Compare';
import Alerts from './pages/Alerts';
import Screener from './pages/Screener';
import Dividends from './pages/Dividends';
import Goals from './pages/Goals';
import RiskAssessment from './pages/RiskAssessment';
import Calculator from './pages/Calculator';
import Rebalancing from './pages/Rebalancing';
import TaxCalculator from './pages/TaxCalculator';
import MarketSentiment from './pages/MarketSentiment';
import Diversification from './pages/Diversification';
import Benchmarking from './pages/Benchmarking';
import LearningCenter from './pages/LearningCenter';
import AdvancedCharting from './pages/AdvancedCharting';
import Reports from './pages/Reports';
import RiskManagement from './pages/RiskManagement';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  console.log('App component rendering');
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/buy/:type/:id" 
          element={
            <ProtectedRoute>
              <Buy />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sell/:id" 
          element={
            <ProtectedRoute>
              <Sell />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/transactions" 
          element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/kyc" 
          element={
            <ProtectedRoute>
              <KYC />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sip/:id" 
          element={
            <ProtectedRoute>
              <SIP />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/news" 
          element={
            <ProtectedRoute>
              <News />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/indices" 
          element={
            <ProtectedRoute>
              <MarketIndices />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/compare" 
          element={
            <ProtectedRoute>
              <Compare />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/alerts" 
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screener" 
          element={
            <ProtectedRoute>
              <Screener />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dividends" 
          element={
            <ProtectedRoute>
              <Dividends />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/goals" 
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/risk-assessment" 
          element={
            <ProtectedRoute>
              <RiskAssessment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calculator" 
          element={
            <ProtectedRoute>
              <Calculator />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rebalancing" 
          element={
            <ProtectedRoute>
              <Rebalancing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tax-calculator" 
          element={
            <ProtectedRoute>
              <TaxCalculator />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/market-sentiment" 
          element={
            <ProtectedRoute>
              <MarketSentiment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/diversification" 
          element={
            <ProtectedRoute>
              <Diversification />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/benchmarking" 
          element={
            <ProtectedRoute>
              <Benchmarking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/learning-center" 
          element={
            <ProtectedRoute>
              <LearningCenter />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/advanced-charting" 
          element={
            <ProtectedRoute>
              <AdvancedCharting />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/risk-management" 
          element={
            <ProtectedRoute>
              <RiskManagement />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
