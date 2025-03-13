import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import Notification from '../common/Notification';
import { useWallet } from '../../hooks/useWallet';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'TARDI Staking',
  description = 'Stake TARDI tokens and earn rewards',
  showSidebar = true,
}) => {
  const location = useLocation();
  const { error: walletError, clearError } = useWallet();
  
  // Update document title when component mounts or title changes
  useEffect(() => {
    document.title = `${title} | TARDI Staking`;
    
    // Optional: Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex-grow flex">
        {/* Sidebar (conditionally shown) */}
        {showSidebar && (
          <div className="hidden md:block w-64 border-r border-gray-200 bg-white">
            <Sidebar />
          </div>
        )}
        
        {/* Page Content */}
        <main className={`flex-grow ${showSidebar ? 'md:ml-64' : ''}`}>
          <div className="container mx-auto px-4 py-6">
            {/* Page Title */}
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                {description && (
                  <p className="text-gray-500 mt-1">{description}</p>
                )}
              </div>
            )}
            
            {/* Wallet Error Notification */}
            {walletError && (
              <div className="mb-6">
                <Notification
                  type="error"
                  message={walletError}
                  onClose={clearError}
                />
              </div>
            )}
            
            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;