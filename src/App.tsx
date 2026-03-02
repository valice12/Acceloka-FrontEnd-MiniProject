import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'; // Pastikan CSS ini di-import

import TicketList from './pages/TicketList';
import DetailTicket from './pages/DetailTicket';
import TicketBookedList from './pages/TicketBookedList';
import DetailTicketBookedList from './pages/DetailTicketBookedList';
import { CartProvider, useCart } from './pages/Cart';

const AppLayout: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { cartItems, setIsCartOpen } = useCart();
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // FUNGSI UNTUK RESET SEARCH
  const handleLogoOrMenuClick = () => {
    setSearchQuery("");
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-content">
            
            <div className="logo-container">
              <Link to="/" onClick={handleLogoOrMenuClick}>
                <img src="/logo.png" alt="Logo" className="logo" />
              </Link>
            </div>

            <div className="search-container">
              <div className="search-wrapper">
                <div className="search-icon-wrapper">
                  <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Cari Tiket atau ID Pesanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="nav-actions">
              <div className="nav-links">
                <Link 
                  to="/" 
                  className="nav-link" 
                  onClick={handleLogoOrMenuClick}
                >
                  Ticket List
                </Link>
                <Link 
                  to="/bookedticketlist" 
                  className="nav-link" 
                  onClick={handleLogoOrMenuClick}
                >
                  My Bookings
                </Link>
              </div>

              <button 
                onClick={() => setIsCartOpen(true)}
                className="cart-btn"
                title="Lihat Keranjang"
              >
                <svg className="cart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                
                {totalItems > 0 && (
                  <span className="cart-badge">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<TicketList searchQuery={searchQuery} />} />
          <Route path="/bookedticketlist" element={<TicketBookedList searchQuery={searchQuery} />} />
          <Route path="/ticket/:id" element={<DetailTicket />} />
          <Route path="/bookedticketlist/:id" element={<DetailTicketBookedList />} />
        </Routes>
      </main>

      <footer className="footer">
         <p>&copy; 2026. All rights reserved.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <CartProvider> 
        <AppLayout />
      </CartProvider>
    </Router>
  );
}

export default App;