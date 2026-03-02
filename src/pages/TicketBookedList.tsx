import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';

interface TicketMaster {
  ticketCode: string;
  ticketName: string;
  categoryName: string;
}

interface Ticket {
  bookedTicketId: string;
  ticketCode: string;
  quantity: number;
  price: number;
  scheduledDate: string;
  purchaseDate: string; // Properti ini akan kita tampilkan
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
  const [ticketMaster, setTicketMaster] = useState<TicketMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const getTicketDetail = (code: string) => {
    const found = ticketMaster.find((tm) => {
      return tm.ticketCode === code;
    });
    return found || { ticketName: code, categoryName: 'Unknown' };
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = searchQuery.toLowerCase();
      const matchOrderId = order.bookedTicketId.toLowerCase().includes(query);
      
      const matchTicketInfo = order.tickets.some((t) => {
        const details = getTicketDetail(t.ticketCode);
        return (
          t.ticketCode.toLowerCase().includes(query) ||
          details.ticketName.toLowerCase().includes(query)
        );
      });

      return matchOrderId || matchTicketInfo;
    });
  }, [orders, ticketMaster, searchQuery]);

  if (loading) {
    return <div className="p-10 text-center">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 text-left">Booked Ticket List</h1>

      {filteredOrders.length > 0 ? (
        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const pDate = order.tickets[0]?.purchaseDate;
            return (
              <div 
                key={order.bookedTicketId}
                onClick={() => { 
                  // Tambahkan argumen kedua untuk mengirim state
                  navigate(`/bookedticketlist/${order.bookedTicketId}`, { 
                    state: { purchaseDate: pDate } 
                  }); 
                }}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 cursor-pointer transition-all text-left"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-gray-400 uppercase">BookedTicket ID</p>
                    <p className="font-bold text-gray-700">{order.bookedTicketId}</p>
                    
                    {/* Tampilan Tanggal Pembelian */}
                    <div className="flex items-center gap-1 mt-2 text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium">Dibeli pada: {formatDate(pDate)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg inline-block">
                       <p className="text-sm font-bold">{order.totalTicketsInOrder} Tiket</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-tighter italic font-semibold">Klik untuk detail →</p>
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-gray-50">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 tracking-widest">Daftar Tiket:</p>
                  <div className="flex flex-wrap gap-2">
                    {order.tickets.map((t) => {
                      const details = getTicketDetail(t.ticketCode);
                      return (
                        <div key={t.ticketCode} className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-md flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-700">{details.ticketName}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">x{t.quantity}</span>
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
        <div className="bg-white p-10 rounded-xl text-center shadow-inner">
          <p className="text-gray-500 italic">Tidak ada pesanan yang sesuai.</p>
        </div>
      )}
    </div>
  );
};

export default TicketBookedList;