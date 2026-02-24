import React from 'react';
import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import TicketList from './TicketList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TicketList />} />
      </Routes>
    </Router>
  );
}

export default App;
