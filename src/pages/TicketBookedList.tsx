import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/TicketBookedList.css'; 

// --- 1. Definisi Interface ---
interface Ticket {
  bookedTicketId: string;
  ticketCode: string;
  quantity: number;
  price: number;
  scheduledDate: string;
  purchaseDate: string;
}

interface BookedOrder {
  bookedTicketId: string;
  tickets: Ticket[];
  totalTicketsInOrder: number;
}

interface TicketMaster {
  ticketCode: string;
  ticketName: string;
  categoryName: string;
}

interface TicketBookedListProps {
  searchQuery: string;
}

const TicketBookedList: React.FC<TicketBookedListProps> = ({ searchQuery }) => {
  const [orders, setOrders] = useState<BookedOrder[]>([]);
  const [ticketMaster, setTicketMaster] = useState<TicketMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mengambil data Booking dan data Master Tiket secara paralel
        const [resOrders, resMaster] = await Promise.all([
          fetch('http://localhost:5287/api/v1/get-all-booked-tickets'),
          fetch('http://localhost:5287/api/v1/get-available-ticket')
        ]);

        if (!resOrders.ok || !resMaster.ok) {
          throw new Error('Gagal mengambil data dari server');
        }

        const dataOrders = await resOrders.json();
        const dataMaster = await resMaster.json();

        setOrders(dataOrders.listBookedTickets);
        setTicketMaster(dataMaster);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper untuk mencari info tiket dari master data
  const getTicketInfo = (code: string) => {
    const found = ticketMaster.find((tm) => {
      return tm.ticketCode === code;
    });
    return found || { ticketName: code, categoryName: 'Unknown' };
  };

  // Helper untuk format tanggal
  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "-";
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // --- LOGIKA PENCARIAN (Berdasarkan ID, Nama Tiket, atau Kategori) ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = searchQuery.toLowerCase();
      const matchOrderId = order.bookedTicketId.toLowerCase().includes(query);
      
      const matchTicketContent = order.tickets.some((t) => {
        const info = getTicketInfo(t.ticketCode);
        return (
          t.ticketCode.toLowerCase().includes(query) ||
          info.ticketName.toLowerCase().includes(query) ||
          info.categoryName.toLowerCase().includes(query)
        );
      });

      return matchOrderId || matchTicketContent;
    });
  }, [orders, ticketMaster, searchQuery]);

  if (loading) {
    return <div className="booked-loading">Loading bookings...</div>;
  }
  
  return (
    <div className="booked-container">
      <h1 className="booked-title">Booked Ticket List</h1>
      
      {filteredOrders.length > 0 ? (
        <div className="booked-grid">
          {filteredOrders.map((order) => {
            const pDate = order.tickets[0]?.purchaseDate;

            return (
              <div 
                key={order.bookedTicketId}
                onClick={() => {
                  navigate(`/bookedticketlist/${order.bookedTicketId}`, {
                    state: { purchaseDate: pDate }
                  });
                }}
                className="booked-card"
              >
                <div className="booked-card-header">
                  <div className="booked-left">
                    <p className="booked-label">BookedTicket ID</p>
                    <p className="booked-id">{order.bookedTicketId}</p>
                    {/* Menampilkan Tanggal Pembelian */}
                    <p className="booked-date">Dibeli: {formatDate(pDate)}</p>
                  </div>
                  <div className="booked-right text-right">
                    <p className="booked-count">
                      {order.totalTicketsInOrder} Tiket
                    </p>
                    <p className="booked-hint italic">Klik untuk detail</p>
                  </div>
                </div>
                
                {/* Menampilkan Nama Tiket & Kategori alih-alih hanya ID */}
                <div className="ticket-tags-container">
                  <p className="ticket-tags-label">Daftar Tiket:</p>
                  <div className="ticket-tags-list">
                    {order.tickets.map((t) => {
                      const info = getTicketInfo(t.ticketCode);
                      return (
                        <div key={t.ticketCode} className="ticket-tag-item">
                          <span className="tag-ticket-name">{info.ticketName}</span>
                          <span className="tag-ticket-category">{info.categoryName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="booked-empty-state">
          <p className="booked-empty-text">Tidak ada pesanan yang cocok dengan "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default TicketBookedList;