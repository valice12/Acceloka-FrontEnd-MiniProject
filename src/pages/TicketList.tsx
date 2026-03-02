import { Link } from 'react-router-dom';
import { textChangeRangeIsUnchanged } from 'typescript';
import { useEffect } from 'react';
import { useState } from 'react';


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
  }, []); // Array kosong berarti hanya dijalankan 1x saat load

  // 3. Logika Filter tetap berjalan secara dinamis pada data yang baru di-fetch
  const filteredTickets = tickets.filter((ticket) =>
    ticket.ticketName.toLowerCase().includes(searchQuery.toLowerCase())
  );

 if (isLoading) {
    return <div className="state-container">Memuat tiket...</div>;
  }
  
  if (error) {
      return <div className="state-container error-text">Error: {error}</div>;
  }

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
