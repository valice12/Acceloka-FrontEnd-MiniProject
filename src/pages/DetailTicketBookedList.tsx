import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface TicketDetail {
  ticketCode: string;
  ticketName: string;
  eventDate: string;
  purchaseDate?: string; // Menambahkan field purchaseDate
  price?: number; 
}

interface BookedCategory {
  quantityPerCategory: number;
  categoryName: string;
  tickets: TicketDetail[];
}

interface TicketMaster {
  ticketCode: string;
  price: number;
}

const DetailTicketBookedList = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const purchaseDateFromState = location.state?.purchaseDate;
  const [orderCategories, setOrderCategories] = useState<BookedCategory[]>([]);
  const [ticketMaster, setTicketMaster] = useState<TicketMaster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});

  const fetchDetailData = useCallback(async () => {
    try {
      setLoading(true);
      const [resDetail, resMaster] = await Promise.all([
        fetch(`http://localhost:5287/api/v1/get-booked-ticket/${id}`),
        fetch(`http://localhost:5287/api/v1/get-available-ticket`)
      ]);
      
      if (!resDetail.ok || !resMaster.ok) {
        throw new Error("Gagal mengambil data dari server.");
      }      

      const dataDetail: BookedCategory[] = await resDetail.json();
      const dataMaster: TicketMaster[] = await resMaster.json();

      setTicketMaster(dataMaster);

      if (dataDetail && dataDetail.length > 0) {
        setOrderCategories(dataDetail);
        setError(null);
      } else {
        setError("Data pesanan tidak ditemukan.");
      }
    } catch (err) {
      setError("Gagal mengambil data dari server.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDetailData();
    }
  }, [fetchDetailData]);

  const getPriceByCode = (code: string): number => {
    const found = ticketMaster.find((item) => {
      return item.ticketCode === code;
    });
    return found ? found.price : 0;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(val);
  };

  // Helper untuk format tanggal & waktu
  const formatDateTime = (dateString?: string) => {
    if (!dateString) {
      return "-";
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const totalBayar = useMemo(() => {
    return orderCategories.reduce((acc, category) => {
      const price = getPriceByCode(category.tickets[0]?.ticketCode);
      return acc + (price * category.quantityPerCategory);
    }, 0);
  }, [orderCategories, ticketMaster]);

  if (loading && orderCategories.length === 0) {
    return <div className="p-10 text-center font-medium">Memuat Detail Pesanan...</div>;
  }
  
  if (error || orderCategories.length === 0) {
    return <div className="p-10 text-center text-red-500 font-bold">{error || "Data tidak ditemukan"}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button onClick={() => { navigate(-1); }} className="mb-6 text-blue-600 font-bold flex items-center hover:text-blue-800 transition">
        <span className="mr-2">←</span> Kembali ke Daftar
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-t-2xl border-b border-gray-100 flex justify-between items-start text-left shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Ringkasan Pesanan</h1>
            <p className="text-xs font-mono text-gray-400 mt-1">ORDER ID: {id}</p>
            
            {/* Tampilkan purchaseDate yang di-parse dari halaman sebelumnya */}
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Tanggal Transaksi: <span className="text-gray-800">
                {purchaseDateFromState ? formatDateTime(purchaseDateFromState) : "Memuat tanggal..."}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end">
             <span className="bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-sm">PAID / LUNAS</span>
          </div>
        </div>

        <div className="space-y-5 mt-5">
          {orderCategories.map((category) => {
            return category.tickets.map((ticket) => {
              const currentQty = draftQuantities[ticket.ticketCode] || category.quantityPerCategory;
              const unitPrice = getPriceByCode(ticket.ticketCode);

              return (
                <div key={ticket.ticketCode} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left transition hover:shadow-md">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                          {category.categoryName}
                        </span>
                        <h2 className="text-lg font-bold text-gray-800 mt-2">{ticket.ticketName}</h2>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] text-gray-400 uppercase font-mono">Ticket Code</p>
                         <p className="text-sm font-bold text-gray-700">{ticket.ticketCode.substring(0, 8)}...</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Waktu Event</p>
                        <p className="text-sm font-semibold text-gray-700">{ticket.eventDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Jumlah Tiket</p>
                        <p className="text-sm font-semibold text-gray-700">{currentQty} Tiket</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Harga Satuan</p>
                        <p className="text-sm font-semibold text-blue-600">{formatCurrency(unitPrice)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Subtotal</p>
                        <p className="text-sm font-bold text-gray-800">{formatCurrency(unitPrice * currentQty)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info tambahan di footer card */}
                  <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-[10px] text-gray-500 italic">
                      Data pembelian diverifikasi pada: {formatDateTime(ticket.purchaseDate)}
                    </p>
                    <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase">Lihat E-Ticket</button>
                  </div>
                </div>
              );
            });
          })}
        </div>

        {/* Total Sticky Section */}
        <div className="mt-8 bg-gray-900 text-white p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Total Bayar Keseluruhan</p>
            <p className="text-3xl font-black text-blue-400">{formatCurrency(totalBayar)}</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold transition">
              Share
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition active:scale-95">
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailTicketBookedList;