import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { formatTokenAmount } from '../../utils/formatters';
import Button from '../common/Button';
import Loader from '../common/Loader';

const Header: React.FC = () => {
  const { 
    connected, 
    address, 
    balance, 
    tokenBalance, 
    connecting, 
    connect, 
    disconnect,
    supportedWallets,
    getFormattedAddress,
    getWalletName,
    getWalletIcon
  } = useWallet();
  
  const [showWalletMenu, setShowWalletMenu] = useState<boolean>(false);
  const [showNavMenu, setShowNavMenu] = useState<boolean>(false);
  const walletMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Close wallet menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target as Node)) {
        setShowWalletMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close menus when route changes
  useEffect(() => {
    setShowWalletMenu(false);
    setShowNavMenu(false);
  }, [location]);
  
  // Handle wallet selection
  const handleWalletSelect = async (providerId: string) => {
    setShowWalletMenu(false);
    await connect(providerId as any);
  };
  
  // Navigation links
  const navLinks = [
    { title: 'Dashboard', path: '/' },
    { title: 'Stake', path: '/stake' },
    { title: 'Rewards', path: '/rewards' },
    { title: 'Stats', path: '/stats' },
    { title: 'About', path: '/about' }
  ];
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/images/tardi-logo.svg" alt="TARDI" className="h-8 w-8 mr-2" />
              <span className="text-lg font-bold text-gray-800">TARDI Staking</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-10 md:flex md:space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium hover:text-blue-600 transition-colors ${
                    location.pathname === link.path 
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                      : 'text-gray-600'
                  }`}
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Wallet Connection */}
          <div className="flex items-center">
            {connected && address ? (
              <div className="relative" ref={walletMenuRef}>
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center text-sm font-medium rounded-full bg-gray-50 hover:bg-gray-100 px-4 py-2 transition-colors"
                >
                  {getWalletIcon() && (
                    <img 
                      src={getWalletIcon()} 
                      alt={getWalletName()} 
                      className="w-4 h-4 mr-2" 
                    />
                  )}
                  <span className="mr-2">{getFormattedAddress()}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showWalletMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Connected with {getWalletName()}</p>
                      <p className="text-sm font-medium">{address}</p>
                    </div>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">SUI Balance</p>
                        <p className="text-sm font-medium">{balance} SUI</p>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-gray-500">TARDI Balance</p>
                        <p className="text-sm font-medium">{formatTokenAmount(tokenBalance)} TARDI</p>
                      </div>
                    </div>
                    <div className="px-4 py-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={disconnect}
                      >
                        Disconnect Wallet
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                disabled={connecting}
                onClick={() => setShowWalletMenu(!showWalletMenu)}
              >
                {connecting ? (
                  <>
                    <Loader size="xs" className="mr-2" />
                    Connecting...
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </Button>
            )}
            
            {/* Wallet Selection Menu */}
            {!connected && showWalletMenu && (
              <div className="absolute right-4 mt-12 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-2" ref={walletMenuRef}>
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700">Select a Wallet</p>
                </div>
                <div className="py-1">
                  {supportedWallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleWalletSelect(wallet.id)}
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      {wallet.icon && (
                        <img 
                          src={wallet.icon} 
                          alt={wallet.name} 
                          className="w-5 h-5 mr-3" 
                        />
                      )}
                      {wallet.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              className="ml-4 md:hidden"
              onClick={() => setShowNavMenu(!showNavMenu)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {showNavMenu && (
          <nav className="md:hidden mt-4 pb-2 border-t border-gray-100 pt-3">
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`block text-sm font-medium ${
                      location.pathname === link.path ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;