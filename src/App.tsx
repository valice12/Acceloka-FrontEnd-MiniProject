import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import TicketList from './pages/TicketList';
import DetailTicket from './pages/DetailTicket';
import TicketBookedList from './pages/TicketBookedList';
import DetailTicketBookedList from './pages/DetailTicketBookedList';
import { CartProvider, useCart } from './pages/Cart'; // Pastikan path ini sesuai

// --- KOMPONEN LAYOUT UTAMA ---
// Kita memisahkan layout ini agar bisa menggunakan useCart() dengan aman
const AppLayout: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Ambil data keranjang dan fungsi untuk membuka overlay
  const { cartItems, setIsCartOpen } = useCart();
  
  // Hitung total kuantitas tiket di keranjang untuk badge (notifikasi merah)
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-gray-800 text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            <div className="flex shrink-0 items-center">
              <Link to="/" onClick={() => setSearchQuery("")}>
                <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
              </Link>
            </div>

            {/* Search Bar Dinamis */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Cari Tiket atau ID Pesanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Menu Navigasi & Tombol Keranjang */}
            <div className="flex items-center gap-4 sm:ml-6">
              <div className="hidden sm:flex space-x-4">
                <Link to="/" className="px-3 py-2 text-sm font-medium hover:text-blue-400" onClick={() => setSearchQuery("")}>Ticket List</Link>
                <Link to="/bookedticketlist" className="px-3 py-2 text-sm font-medium hover:text-blue-400" onClick={() => setSearchQuery("")}>My Bookings</Link>
              </div>

              {/* TOMBOL KERANJANG BARU */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-300 hover:text-white transition bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center"
                title="Lihat Keranjang"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                
                {/* Badge Notifikasi Angka (Hanya muncul jika ada isi) */}
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 border-2 border-gray-800 rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </nav>

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-8">
        <Routes>
          <Route path="/" element={<TicketList searchQuery={searchQuery} />} />
          <Route path="/bookedticketlist" element={<TicketBookedList searchQuery={searchQuery} />} />
          <Route path="/ticket/:id" element={<DetailTicket />} />
          <Route path="/bookedticketlist/:id" element={<DetailTicketBookedList />} />
        </Routes>
      </main>

      <footer className="bg-gray-800 text-gray-400 py-6 text-center border-t border-gray-700">
         <p>&copy; 2026 {/*orderDetail.namaPemesan*/}. All rights reserved.</p>
      </footer>
    </div>
  );
};

// --- KOMPONEN ROOT / APP ---
const App: React.FC = () => {
  return (
    <Router>
      <CartProvider> 
        {/* AppLayout sekarang berada DI DALAM CartProvider, sehingga useCart() bisa bekerja */}
        <AppLayout />
      </CartProvider>
    </Router>
  );
}

export default App;