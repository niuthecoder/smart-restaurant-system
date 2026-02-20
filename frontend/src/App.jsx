import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SpecialOffers from './components/SpecialOffers';
import MenuSection from './components/MenuSection';
import About from './components/About';
import Contact from './components/Contact';
import OrderPage from './components/OrderPage';
import BookTable from './components/BookTable';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import WaiterLogin from './components/WaiterLogin';
import WaiterDashboard from './components/WaiterDashboard';
import KitchenDisplay from './components/KitchenDisplay';
import WaitlistPage from './components/WaitlistPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import NotFoundPage from './components/NotFoundPage';
import OrderStatusPage from './components/OrderStatusPage';
import ReviewsSection from './components/ReviewsSection';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Main app content that uses auth
function AppContent() {
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const h = typeof window !== 'undefined' && window.location && window.location.hash;
      return (h ? String(h).replace(/^#/, '') : '') || 'home';
    } catch (_) {
      return 'home';
    }
  });
  const { isAuthenticated, logout, user, loading: authLoading } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      try {
        const hash = window.location.hash ? String(window.location.hash).replace(/^#/, '') : '';
        setCurrentPage(hash || 'home');
      } catch (_) {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  // Waiter / Kitchen routes
  if (currentPage === 'waiter-login') {
    return <WaiterLogin />;
  }

  if (currentPage === 'kitchen') {
    if (!isAuthenticated || (user?.role !== 'WAITER' && user?.role !== 'ADMIN')) {
      return <WaiterLogin />;
    }
    return (
      <ProtectedRoute>
        <KitchenDisplay onLogout={handleLogout} />
      </ProtectedRoute>
    );
  }

  if (currentPage === 'waiter-dashboard') {
    if (!isAuthenticated || user?.role !== 'WAITER') {
      return <WaiterLogin />;
    }
    return (
      <ProtectedRoute>
        <WaiterDashboard onLogout={handleLogout} />
      </ProtectedRoute>
    );
  }

  // Admin routes
  if (currentPage === 'admin') {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      return <Login />;
    }
    return (
      <ProtectedRoute adminOnly={true}>
        <AdminDashboard onLogout={handleLogout} />
      </ProtectedRoute>
    );
  }

  // Public customer routes
  if (currentPage === 'waitlist') {
    return (
      <>
        <Navbar />
        <WaitlistPage />
      </>
    );
  }
  if (currentPage === 'forgot-password') {
    return <ForgotPassword />;
  }
  if (currentPage === 'reset-password') {
    return <ResetPassword />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mono-50 dark:bg-mono-900">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-2 border-mono-300 border-t-mono-700 rounded-full animate-spin mb-4" />
          <p className="text-mono-600 dark:text-mono-400">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (currentPage.startsWith('order-status')) return <OrderStatusPage />;
    switch (currentPage) {
      case 'order':
        return <OrderPage />;
      case 'book-table':
        return <BookTable />;
      case 'home':
      case 'menu':
      case 'offers':
      case 'about':
      case 'reviews':
      case 'contact':
        return (
          <>
            <Hero />
            <SpecialOffers />
            <MenuSection />
            <About />
            <ReviewsSection />
            <Contact />
            <Footer />
          </>
        );
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="App min-h-screen persian-pattern-bg dark:bg-mono-900 text-mono-900 dark:text-mono-100 transition-colors w-full max-w-7xl mx-auto">
      <Navbar />
      {renderPage()}
    </div>
  );
}

// Main App wrapper with AuthProvider + BrandingProvider (SaaS white-label)
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrandingProvider>
            <AppContent />
          </BrandingProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;