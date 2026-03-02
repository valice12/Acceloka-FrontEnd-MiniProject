import React, { useEffect, useState, useMemo } from 'react';
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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk Sort dan Pagination
  const [sortOrder, setSortOrder] = useState<string>('none');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5287/api/v1/get-available-ticket'); 
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data tiket');
        }   

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

  // Reset ke halaman 1 jika mencari atau mengubah urutan
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder]);

  // Logic: Filter berdasarkan Nama & Kategori + Sorting
  const filteredAndSortedTickets = useMemo(() => {
    let result = tickets.filter((ticket) => {
      return (
        ticket.ticketName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    if (sortOrder === 'asc') {
      result.sort((a, b) => { return a.price - b.price; });
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => { return b.price - a.price; });
    }

    return result;
  }, [tickets, searchQuery, sortOrder]);

  // Logic: Pagination (Hanya ambil 10 item)
  const currentTickets = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredAndSortedTickets.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredAndSortedTickets, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedTickets.length / itemsPerPage);

  if (isLoading) {
    return <div className="state-container">Memuat tiket...</div>;
  }
  if (error) {
    return <div className="state-container error-text">Error: {error}</div>;
  }
  
  return (
    <div className="ticket-list-container">
      <div className="ticket-list-header-section">
        <h1 className="ticket-list-title">Daftar Tiket Tersedia</h1>
        
        {/* Dropdown Sorting */}
        <div className="sort-container">
          <label htmlFor="sortPrice" className="sort-label">Urutkan Harga:</label>
          <select 
            id="sortPrice"
            className="sort-select"
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value); }}
          >
            <option value="none">Default</option>
            <option value="asc">Termurah</option>
            <option value="desc">Termahal</option>
          </select>
        </div>
      </div>
      
      <div className="ticket-grid">
        {currentTickets.length > 0 ? (
          currentTickets.map((ticket) => {
            return (
              <Link key={ticket.ticketCode} to={`/ticket/${ticket.ticketCode}`} className="ticket-link">
                <div className="ticket-card">
                  <div className="ticket-card-accent"></div>
                  <div className="ticket-card-content">
                    <div className="ticket-card-header">
                      <div className="ticket-info-group">
                        <h2 className="ticket-title">{ticket.ticketName}</h2>
                        <span className="ticket-category-badge">{ticket.categoryName}</span>
                      </div>
                      <span className="ticket-price">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(ticket.price)}
                      </span>
                    </div>
                    <p className="ticket-details">Stok: {ticket.quota} tiket tersisa</p>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="not-found-container">
            <p className="ticket-not-found">Tiket tidak ditemukan.</p>
          </div>
        )}
      </div>

      {/* Navigasi Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button 
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() => { setCurrentPage((prev) => { return prev - 1; }); }}
          >
            Kembali
          </button>
          
          <span className="pagination-info">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button 
            className="pagination-button"
            disabled={currentPage === totalPages}
            onClick={() => { setCurrentPage((prev) => { return prev + 1; }); }}
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketList;