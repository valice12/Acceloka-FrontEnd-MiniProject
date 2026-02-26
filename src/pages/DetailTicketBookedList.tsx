import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// 1. Definisikan Interface agar TypeScript tidak error
interface Ticket {
  bookedTicketId: string;
  ticketCode: string;
  quantity: number;
  price: number;
  scheduledDate: string;
}

interface BookedOrder {
  bookedTicketId: string;
  tickets: Ticket[];
  totalTicketsInOrder: number;
}

const DetailTicketBookedList = () => {
  // Mengambil ID dari URL
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();

  // 2. State untuk menampung data dinamis
  const [orderDetail, setOrderDetail] = useState<BookedOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        setLoading(true);
        // GANTI URL INI dengan endpoint API asli Anda
        const response = await fetch('http://localhost:5287/api/v1/get-all-booked-tickets'); 
        const data = await response.json();

        // 3. Cari data spesifik dari list yang ditarik secara dinamis
        const foundOrder = data.listBookedTickets.find(
          (item: BookedOrder) => item.bookedTicketId === id
        );

        if (foundOrder) {
          setOrderDetail(foundOrder);
        } else {
          setError("Data pesanan tidak ditemukan.");
        }
      } catch (err) {
        setError("Gagal mengambil data dari server.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetailData();
  }, [id]); // Re-run jika ID di URL berubah

  // Helper Format Mata Uang
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  // --- Render Logic ---
  if (loading) return <div className="p-10 text-center">Memuat Detail Pesanan...</div>;
  if (error || !orderDetail) return <div className="p-10 text-center text-red-500">{error}</div>;

  const totalBayar = orderDetail.tickets.reduce((acc, t) => acc + (t.price * t.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 font-medium flex items-center hover:underline">
        ← Kembali ke Daftar Pesanan
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-t-2xl border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Detail Pesanan</h1>
            <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase">ID: {orderDetail.bookedTicketId}</p>
          </div>
          <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold">Terbayar</span>
        </div>

        <div className="space-y-4 mt-4">
          {orderDetail.tickets.map((ticket, index) => (
            <div key={ticket.ticketCode} className="bg-white rounded-xl shadow-md overflow-hidden border-l-8 border-blue-500 text-left p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-blue-600">Tiket #{index + 1}</h2>
                  <p className="text-sm text-gray-500 font-medium">{ticket.quantity} Tiket</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 uppercase text-[10px] tracking-widest">Kode Tiket</p>
                  <p className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">{ticket.ticketCode.split('-')[0]}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-bold border-2 border-gray-300">QR</div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Jadwal: {new Date(ticket.scheduledDate).toLocaleDateString('id-ID')}</p>
                  <p className="text-[11px] text-gray-400">Scan QR ini saat tiba di pintu masuk lokasi.</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-gray-800 p-6 rounded-xl flex justify-between items-center text-white shadow-lg">
          <div>
            <p className="text-xs text-gray-400 uppercase">Total Pembayaran</p>
            <p className="text-xl font-bold">{formatCurrency(totalBayar)}</p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-bold">Download PDF</button>
        </div>
      </div>
    </div>
  );
};

export default DetailTicketBookedList;