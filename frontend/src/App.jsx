import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import Login from './components/Login'; // New login component
import ProtectedRoute from './components/ProtectedRoute'; // New protected route
import './App.css';

// Main app content that uses auth
function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const { isAuthenticated, logout, user } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(window.location.hash.substring(1) || 'home');
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAdminLogout = () => {
    logout();
    setCurrentPage('home');
  };

  // Admin routes - using new auth system
  if (currentPage === 'admin') {
    if (!isAuthenticated) {
      return <Login />; // Use new login component
    }
    
    return (
      <ProtectedRoute adminOnly={true}>
        <AdminDashboard onLogout={handleAdminLogout} />
      </ProtectedRoute>
    );
  }

  // Customer routes (unchanged)
  const renderPage = () => {
    switch (currentPage) {
      case 'order':
        return <OrderPage />;
      case 'book-table':
        return <BookTable />;
      case 'home':
      case 'menu':
      case 'offers':
      case 'about':
      case 'contact':
      default:
        return (
          <>
            <Hero />
            <SpecialOffers />
            <MenuSection />
            <About />
            <Contact />
            <Footer />
          </>
        );
    }
  };

  return (
    <div className="App">
      <Navbar />
      {renderPage()}
    </div>
  );
}

// Main App wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;