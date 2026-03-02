import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';

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
  const [sortOrder, setSortOrder] = useState<string>('none');
  
  // State Pagination
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

  // Reset ke halaman 1 jika filter atau sort berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder]);

  const allFilteredTickets = useMemo(() => {
    // Filter Nama atau Kategori
    let result = tickets.filter((ticket) => {
      return (
        ticket.ticketName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // Sort Harga
    if (sortOrder === 'asc') {
      result.sort((a, b) => { return a.price - b.price; });
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => { return b.price - a.price; });
    }

    return result;
  }, [tickets, searchQuery, sortOrder]);

  // Hitung data per halaman
  const currentTickets = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return allFilteredTickets.slice(indexOfFirstItem, indexOfLastItem);
  }, [allFilteredTickets, currentPage]);

  const totalPages = Math.ceil(allFilteredTickets.length / itemsPerPage);

  if (isLoading) {
    return <div className="p-4 text-center">Memuat tiket...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 text-left">
        <h1 className="text-2xl font-bold">Daftar Tiket Tersedia</h1>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Urutkan Harga:</label>
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value); }}
          >
            <option value="none">Default</option>
            <option value="asc">Termurah</option>
            <option value="desc">Termahal</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 text-left">
        {currentTickets.length > 0 ? (
          currentTickets.map((ticket) => {
            return (
              <Link key={ticket.ticketCode} to={`/ticket/${ticket.ticketCode}`}>
                <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                  <div className="bg-blue-600 w-2 h-full"></div>
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-bold text-lg leading-tight">{ticket.ticketName}</h2>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {ticket.categoryName}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 whitespace-nowrap ml-4">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(ticket.price)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Stok: {ticket.quota} tiket tersisa</p>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-400 italic">Tiket tidak ditemukan.</p>
          </div>
        )}
      </div>

      {/* Kontrol Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            disabled={currentPage === 1}
            onClick={() => { setCurrentPage((prev) => { return prev - 1; }); }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Kembali
          </button>
          
          <span className="text-sm font-medium">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => { setCurrentPage((prev) => { return prev + 1; }); }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketList;