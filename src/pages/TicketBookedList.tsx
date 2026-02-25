import { Link } from 'react-router-dom';

const TicketBookedList = () => {
  // Data dummy untuk tiket yang sudah dipesan
  const bookedTickets = [
    { id: "BKD-101", judul: "Konser Coldplay", tanggalPesan: "24 Feb 2026", status: "Sudah Bayar" },
    { id: "BKD-102", judul: "Seminar Tech 2026", tanggalPesan: "20 Feb 2026", status: "Menunggu Pembayaran" },
    { id: "BKD-103", judul: "Final Liga Champions", tanggalPesan: "15 Feb 2026", status: "Dibatalkan" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Booked Tickets</h1>
      
      <div className="space-y-4">
        {bookedTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Link to={`/bookedticketlist/${ticket.id}`} className="block p-5 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{ticket.judul}</h2>
                  <p className="text-sm text-gray-500 mt-1">ID Pesanan: {ticket.id}</p>
                  <p className="text-xs text-gray-400 mt-2">Dipesan pada: {ticket.tanggalPesan}</p>
                </div>
                
                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  ticket.status === "Sudah Bayar" ? "bg-green-100 text-green-600" :
                  ticket.status === "Menunggu Pembayaran" ? "bg-yellow-100 text-yellow-600" :
                  "bg-red-100 text-red-600"
                }`}>
                  {ticket.status}
                </span>
              </div>
              
              <div className="mt-4 text-blue-600 text-sm font-medium flex items-center">
                Lihat Detail Pesanan 
                <span className="ml-1">→</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketBookedList;