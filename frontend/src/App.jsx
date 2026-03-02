import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';
import MobileCartBar from './components/MobileCartBar';
import './App.css';

const SpecialOffers = lazy(() => import('./components/SpecialOffers'));
const MenuSection = lazy(() => import('./components/MenuSection'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const ReviewsSection = lazy(() => import('./components/ReviewsSection'));
const OrderPage = lazy(() => import('./components/OrderPage'));
const BookTable = lazy(() => import('./components/BookTable'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const Login = lazy(() => import('./components/Login'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const WaiterLogin = lazy(() => import('./components/WaiterLogin'));
const WaiterDashboard = lazy(() => import('./components/WaiterDashboard'));
const KitchenDisplay = lazy(() => import('./components/KitchenDisplay'));
const WaitlistPage = lazy(() => import('./components/WaitlistPage'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));
const OrderStatusPage = lazy(() => import('./components/OrderStatusPage'));

const PageSpinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="inline-block w-8 h-8 border-2 border-mono-300 border-t-mono-700 rounded-full animate-spin" />
  </div>
);

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
    return <Suspense fallback={<PageSpinner />}><WaiterLogin /></Suspense>;
  }

  if (currentPage === 'kitchen') {
    if (!isAuthenticated || (user?.role !== 'WAITER' && user?.role !== 'ADMIN')) {
      return <Suspense fallback={<PageSpinner />}><WaiterLogin /></Suspense>;
    }
    return (
      <Suspense fallback={<PageSpinner />}>
        <ProtectedRoute>
          <KitchenDisplay onLogout={handleLogout} />
        </ProtectedRoute>
      </Suspense>
    );
  }

  if (currentPage === 'waiter-dashboard') {
    if (!isAuthenticated || user?.role !== 'WAITER') {
      return <Suspense fallback={<PageSpinner />}><WaiterLogin /></Suspense>;
    }
    return (
      <Suspense fallback={<PageSpinner />}>
        <ProtectedRoute>
          <WaiterDashboard onLogout={handleLogout} />
        </ProtectedRoute>
      </Suspense>
    );
  }

  // Admin routes
  if (currentPage === 'admin') {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      return <Suspense fallback={<PageSpinner />}><Login /></Suspense>;
    }
    return (
      <Suspense fallback={<PageSpinner />}>
        <ProtectedRoute adminOnly={true}>
          <AdminDashboard onLogout={handleLogout} />
        </ProtectedRoute>
      </Suspense>
    );
  }

  // Public customer routes
  if (currentPage === 'waitlist') {
    return (
      <>
        <Navbar />
        <Suspense fallback={<PageSpinner />}><WaitlistPage /></Suspense>
      </>
    );
  }
  if (currentPage === 'forgot-password') {
    return <Suspense fallback={<PageSpinner />}><ForgotPassword /></Suspense>;
  }
  if (currentPage === 'reset-password') {
    return <Suspense fallback={<PageSpinner />}><ResetPassword /></Suspense>;
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
    if (currentPage.startsWith('order-status')) return <Suspense fallback={<PageSpinner />}><OrderStatusPage /></Suspense>;
    switch (currentPage) {
      case 'order':
        return <Suspense fallback={<PageSpinner />}><OrderPage /></Suspense>;
      case 'book-table':
        return <Suspense fallback={<PageSpinner />}><BookTable /></Suspense>;
      case 'home':
      case 'menu':
      case 'offers':
      case 'about':
      case 'reviews':
      case 'contact':
        return (
          <Suspense fallback={<PageSpinner />}>
            <Hero />
            <SpecialOffers />
            <MenuSection />
            <About />
            <ReviewsSection />
            <Contact />
            <Footer />
          </Suspense>
        );
      default:
        return <Suspense fallback={<PageSpinner />}><NotFoundPage /></Suspense>;
    }
  };

  return (
    <div className="App min-h-screen persian-pattern-bg dark:bg-mono-900 text-mono-900 dark:text-mono-100 transition-colors w-full max-w-7xl mx-auto">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:bg-mono-900 focus:text-mono-50 focus:px-4 focus:py-2 focus:rounded-sm focus:text-sm focus:font-semibold">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        {renderPage()}
      </main>
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
            <MobileCartBar />
            <OfflineBanner />
          </BrandingProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;