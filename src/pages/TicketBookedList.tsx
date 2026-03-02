// import { Link } from 'react-router-dom';

// interface Props {
//   searchQuery: string;
// }

// const TicketBookedList: React.FC<Props> = ({ searchQuery }) => {
//   const bookedTickets = [
//     { id: "BKD-101", judul: "Konser Coldplay", tanggalPesan: "24 Feb 2026", status: "Sudah Bayar" },
//     { id: "BKD-102", judul: "Seminar Tech 2026", tanggalPesan: "20 Feb 2026", status: "Menunggu Pembayaran" },
//   ];

//   // Logika Filter: Mencari berdasarkan ID atau Judul
//   const filteredTickets = bookedTickets.filter((ticket) => 
//     ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     ticket.judul.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6 text-left">My Bookings</h1>
//       <div className="space-y-4">
//         {filteredTickets.length > 0 ? (
//           filteredTickets.map((ticket) => (
//             <div key={ticket.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//                {/* ... isi card seperti sebelumnya ... */}
//                <Link to={`/bookedticketlist/${ticket.id}`} className="text-blue-600 font-bold uppercase">
//                  Detail: {ticket.id}
//                </Link>
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-500 italic">Pesanan dengan ID "{searchQuery}" tidak ditemukan.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TicketBookedList;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/TicketBookedList.css'; // Memanggil file CSS yang baru

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

interface TicketBookedListProps {
  searchQuery: string;
}

const TicketBookedList: React.FC<TicketBookedListProps> = ({ searchQuery }) => {
  const [orders, setOrders] = useState<BookedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5287/api/v1/get-all-booked-tickets');
        const data = await response.json();
        setOrders(data.listBookedTickets);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // --- LOGIKA PENCARIAN ---
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    
    // Cek apakah ID Pesanan cocok
    const matchOrderId = order.bookedTicketId.toLowerCase().includes(query);
    
    // Cek apakah ada salah satu kode tiket di dalam array tickets yang cocok
    const matchTicketCode = order.tickets.some(ticket => 
      ticket.ticketCode.toLowerCase().includes(query)
    );

    return matchOrderId || matchTicketCode;
  });

  if (loading) return <div className="booked-loading">Loading bookings...</div>;

  return (
    <div className="booked-container">
      <h1 className="booked-title">Booked Ticket List</h1>
      
      {filteredOrders.length > 0 ? (
        <div className="booked-grid">
          {filteredOrders.map((order) => (
            <div 
              key={order.bookedTicketId}
              onClick={() => navigate(`/bookedticketlist/${order.bookedTicketId}`)}
              className="booked-card"
            >
              <div className="booked-card-header">
                <div>
                  <p className="booked-label">BookedTicket ID</p>
                  <p className="booked-id">{order.bookedTicketId}</p>
                </div>
                <div className="booked-right">
                  <p className="booked-count">
                    {order.totalTicketsInOrder} Tiket
                  </p>
                  <p className="booked-hint">Klik untuk detail</p>
                </div>
              </div>
              
              {/* Menampilkan cuplikan kode tiket yang ada di dalamnya */}
              <div className="ticket-tags-container">
                {order.tickets.map(t => (
                  <span key={t.ticketCode} className="ticket-tag">
                    {t.ticketCode.split('-')[0]}...
                  </span>
                ))}
              </div>
            </div>
          ))}
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