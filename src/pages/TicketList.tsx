import { Link } from 'react-router-dom';
import { textChangeRangeIsUnchanged } from 'typescript';
import { useEffect } from 'react';
import { useState } from 'react';


// const TicketList = () => {
//     const showTicket = () => {
//         return Array.from({length:3}).map((_, i) => (
//             <li key={i} className="mb-3 list-none">
//                 <Link to='/ticket/${i + 1}'>
//                     Ticket {i + 1}
//                      <div className="flex w-full bg-gray-200">
//                         <div className="flex items-center bg-gray-400 mr-4 pr-4 pl-4 h-[120px]"> picture nanti nya di sebelah kiri </div>
//                         <div className="pr-4 pl-4 bg-blue-100 flex-1">
//                             <div className="Nama Ticket">Judul</div>
//                             <div className="kodeticket">KODE TICKET</div>
//                             <div className="hargaticket">Harga Ticket</div>
//                             <div className="rangewaktu">Range Waktu</div>
//                         </div>
//                     </div>
//                 </Link>
//             </li>
//         ));
//     };

//     return(
//         <div className="p-4">
//             <h1 className="text-2xl font-bold mb-4"> Ticket List</h1>
//             <ul>
//                 {showTicket()}
//             </ul>
//
// terus nanti di sini dikasih tombol keranjang supaya bisa multiple buy 
// berarti bikin poolnya dulu
// terus nanti kita masukin datanya ke pool
// terus nanti kita oper ke post-ticket
//         </div>
//     );
// };


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
  }, []); // Array kosong berarti hanya dijalankan 1x saat load

  // 3. Logika Filter tetap berjalan secara dinamis pada data yang baru di-fetch
  const filteredTickets = tickets.filter((ticket) =>
    ticket.ticketName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading State
  if (isLoading) return <div className="p-10 text-center">Memuat tiket...</div>;
  
  // Error State
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-left">Daftar Tiket Tersedia</h1>
      
      <div className="grid grid-cols-1 gap-4 text-left">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <Link key={ticket.ticketCode} to={`/ticket/${ticket.ticketCode}`}>
              <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                <div className="bg-blue-600 w-2 h-full"></div>
                <div className="p-5 flex-1">
                  <div className="flex justify-between">
                    <h2 className="font-bold text-lg">{ticket.ticketName}</h2>
                    <span className="text-sm font-bold text-blue-600">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(ticket.price)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{ticket.categoryName} • Stok: {ticket.quota}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-400 italic">Tiket tidak ditemukan.</p>
        )}
      </div>
    </div>
  );
};

export default TicketList;
