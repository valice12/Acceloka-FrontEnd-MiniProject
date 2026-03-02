import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/TicketList.css'; 

interface Ticket {
  ticketCode: string;
  ticketName: string;
  categoryName: string;
  quota: number;
  price: number;
  eventDateStart: string;
}

interface TicketListProps {
  searchQuery: string;
}

const TicketList: React.FC<TicketListProps> = ({ searchQuery }) => {
  // 1. State untuk menampung data dari API
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Mengambil data dari Backend saat komponen pertama kali dibuka
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        // Ganti URL ini dengan endpoint API backend kamu
        const response = await fetch('http://localhost:5287/api/v1/get-available-ticket'); 
        
        if (!response.ok) throw new Error('Gagal mengambil data tiket');
        
        const data = await response.json();
        setTickets(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // 3. Logika Filter
  const filteredTickets = tickets.filter((ticket) =>
    ticket.ticketName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading State
  if (isLoading) return <div className="state-container">Memuat tiket...</div>;
  
  // Error State
  if (error) return <div className="state-container error-text">Error: {error}</div>;

  return (
    <div className="ticket-list-container">
      <h1 className="ticket-list-title">Daftar Tiket Tersedia</h1>
      
      <div className="ticket-grid">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <Link key={ticket.ticketCode} to={`/ticket/${ticket.ticketCode}`} className="ticket-link">
              <div className="ticket-card">
                <div className="ticket-card-accent"></div>
                <div className="ticket-card-content">
                  <div className="ticket-card-header">
                    <h2 className="ticket-title">{ticket.ticketName}</h2>
                    <span className="ticket-price">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(ticket.price)}
                    </span>
                  </div>
                  <p className="ticket-details">{ticket.categoryName} • Stok: {ticket.quota}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="ticket-not-found">Tiket tidak ditemukan.</p>
        )}
      </div>
    </div>
  );
};

export default TicketList;