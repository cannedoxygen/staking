import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletContextProvider } from './context/WalletContext';
import { StakingContextProvider } from './context/StakingContext';

// Pages
import Dashboard from './pages/Dashboard';
import Stake from './pages/Stake';
import Rewards from './pages/Rewards';
import Stats from './pages/Stats';
import About from './pages/About';

// CSS
import './assets/styles/index.css';

const App: React.FC = () => {
  return (
    <Router>
      {/* Wallet Provider wraps the entire app for global access */}
      <WalletContextProvider>
        {/* Staking Provider for staking functionality */}
        <StakingContextProvider>
          <Routes>
            {/* Main Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/stake" element={<Stake />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/about" element={<About />} />
            
            {/* Redirect any unknown routes to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StakingContextProvider>
      </WalletContextProvider>
    </Router>
  );
};

export default App;