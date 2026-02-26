import { Link } from 'react-router-dom';

interface Props {
  searchQuery: string;
}

const TicketBookedList: React.FC<Props> = ({ searchQuery }) => {
  const bookedTickets = [
    { id: "BKD-101", judul: "Konser Coldplay", tanggalPesan: "24 Feb 2026", status: "Sudah Bayar" },
    { id: "BKD-102", judul: "Seminar Tech 2026", tanggalPesan: "20 Feb 2026", status: "Menunggu Pembayaran" },
  ];

  // Logika Filter: Mencari berdasarkan ID atau Judul
  const filteredTickets = bookedTickets.filter((ticket) => 
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.judul.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-left">My Bookings</h1>
      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               {/* ... isi card seperti sebelumnya ... */}
               <Link to={`/bookedticketlist/${ticket.id}`} className="text-blue-600 font-bold uppercase">
                 Detail: {ticket.id}
               </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">Pesanan dengan ID "{searchQuery}" tidak ditemukan.</p>
        )}
      </div>
    </div>
  );
};

export default TicketBookedList;