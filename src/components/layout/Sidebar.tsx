import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { formatTokenAmount } from '../../utils/formatters';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { connected, address, tokenBalance } = useWallet();
  
  // Navigation items with icons
  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Stake',
      path: '/stake',
      icon: (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Rewards',
      path: '/rewards',
      icon: (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
    },
    {
      name: 'Stats',
      path: '/stats',
      icon: (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'About',
      path: '/about',
      icon: (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="h-full flex flex-col">
      {/* User Balance Card (if connected) */}
      {connected && address && (
        <div className="p-4 border-b border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Your TARDI Balance</p>
            <p className="text-lg font-bold text-gray-800">
              {formatTokenAmount(tokenBalance)}
            </p>
            <Link 
              to="/stake" 
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 inline-flex items-center"
            >
              Stake Tokens
              <svg className="ml-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-grow p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = 
              location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
              
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-sm font-medium 
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    transition-colors
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                  
                  {isActive && (
                    <span className="ml-auto bg-blue-100 rounded-full w-2 h-2"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Information */}
      <div className="p-4 text-xs text-gray-500 border-t border-gray-200">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          Mainnet Connected
        </div>
        <a 
          href="https://explorer.sui.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          View in Explorer
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;