import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import TicketList from './pages/TicketList';
import DetailTicket from './pages/DetailTicket';
import TicketBookedList from './pages/TicketBookedList';
import DetailTicketBookedList from './pages/DetailTicketaBookedList';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Router>
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

              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  <Link to="/" className="px-3 py-2 text-sm font-medium hover:text-blue-400" onClick={() => setSearchQuery("")}>Ticket List</Link>
                  <Link to="/bookedticketlist" className="px-3 py-2 text-sm font-medium hover:text-blue-400" onClick={() => setSearchQuery("")}>My Bookings</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-8">
          <Routes>
            {/* Teruskan searchQuery ke masing-masing komponen */}
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
    </Router>
  );
}

export default App;