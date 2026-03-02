import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

// 1. Definisikan Interface sesuai dengan struktur JSON dari API yang baru
interface TicketDetail {
  ticketCode: string;
  ticketName: string;
  eventDate: string;
  price?: number; // Dibuat opsional berjaga-jaga jika API belum/tidak mengirimkan harga
}

interface BookedCategory {
  quantityPerCategory: number;
  categoryName: string;
  tickets: TicketDetail[];
}

const DetailTicketBookedList = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();

  // 2. State disesuaikan untuk menampung array kategori
  const [orderCategories, setOrderCategories] = useState<BookedCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});

  const fetchDetailData = useCallback(async () => {
    try {
      setLoading(true);
      // Menggunakan endpoint API yang baru sesuai ID
      const response = await fetch(`http://localhost:5287/api/v1/get-booked-ticket/${id}`);
      
      if (!response.ok) {
          throw new Error("Gagal mengambil data pesanan.");
      }      

      const data: BookedCategory[] = await response.json();

      if (data && data.length > 0) {
        setOrderCategories(data);
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

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  if (loading && orderCategories.length === 0) {
      return <div className="detail-status">Memuat Detail Pesanan...</div>;
  }
  if (error || orderCategories.length === 0) {
      return <div className="detail-status detail-error">{error || "Data kosong"}</div>;
  }
  // Kalkulasi total bayar berdasarkan quantity kategori * harga tiket (jika ada)
  const totalBayar = orderCategories.reduce((acc, category) => {
    const price = category.tickets[0]?.price || 0;
    return acc + (price * category.quantityPerCategory);
  }, 0);

  const handleLocalQuantityChange = (ticketCode: string, originalQty: number, delta: number) => {
    const currentQty = draftQuantities[ticketCode] !== undefined ? draftQuantities[ticketCode] : originalQty;
    const newQuantity = currentQty + delta;

    if (newQuantity < 1) {
      alert("Jumlah tiket minimal adalah 1. Gunakan tombol hapus jika ingin membatalkan tiket.");
      return;
    }

    setDraftQuantities(prev => ({
      ...prev,
      [ticketCode]: newQuantity
    }));
  };

  const handleSaveQuantity = async (ticketCode: string, originalQty: number) => {
    const newQuantity = draftQuantities[ticketCode];
    
  if (!newQuantity || newQuantity === originalQty) {
      return;
  }
    const action = newQuantity > originalQty ? "menambah" : "mengurangi";
    const confirmMsg = `Apakah Anda yakin ingin ${action} jumlah tiket menjadi ${newQuantity}?`;

    if (window.confirm(confirmMsg)) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5287/api/v1/edit-booked-ticket/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tickets: [{ ticketCode, quantity: newQuantity }]
          })
        });

        if (response.ok) {
          alert("Berhasil memperbarui jumlah tiket.");
          
          setDraftQuantities(prev => {
            const newState = { ...prev };
            delete newState[ticketCode];
            return newState;
          });

          await fetchDetailData(); 
        } else {
          alert("Gagal memperbarui tiket. Silakan cek koneksi atau ketersediaan tiket.");
        }
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan sistem.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelDraft = (ticketCode: string) => {
    setDraftQuantities(prev => {
      const newState = { ...prev };
      delete newState[ticketCode];
      return newState;
    });
  };

  const handleDeleteTicket = async (ticketCode: string, currentQuantity: number) => {
    if (window.confirm("PERINGATAN: Tiket yang sudah dihapus tidak dapat dikembalikan. Lanjutkan hapus tiket?")) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5287/api/v1/revoke-ticket/${id}/${ticketCode}/${currentQuantity}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert("Tiket berhasil dihapus.");
          await fetchDetailData(); 
        } else {
          alert("Gagal menghapus tiket.");
        }
      } catch (err) {
        alert("Terjadi kesalahan saat menghapus.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 font-medium flex items-center hover:underline">
        ← Kembali ke Daftar Pesanan
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-t-2xl border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Detail Pesanan</h1>
            <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase">ID: {id}</p>
          </div>
          <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold">Status Pembayaran</span>
        </div>

       <div className="space-y-4 mt-4">
          {/* Mapping kategori, kemudian mapping tiket di dalamnya */}
          {orderCategories.map((category, catIndex) => (
            category.tickets.map((ticket, tIndex) => {
              // Gunakan quantityPerCategory sebagai original quantity
              const originalQty = category.quantityPerCategory;
              
              const currentDisplayQty = draftQuantities[ticket.ticketCode] !== undefined 
                ? draftQuantities[ticket.ticketCode] 
                : originalQty;
              
              const isChanged = currentDisplayQty !== originalQty;

              return (
                <div key={ticket.ticketCode} className="bg-white rounded-xl shadow-md overflow-hidden border-l-8 border-blue-500 text-left p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-blue-600">
                        Tiket #{catIndex + 1}.{tIndex + 1} - <span className="text-gray-500 text-sm font-normal">{category.categoryName}</span>
                      </h2>
                      
                      <h3 className="text-base font-semibold text-gray-800 mt-1">
                        {ticket.ticketName}
                      </h3>
                      
                      {/* Kontrol Jumlah Tiket */}
                      <div className="flex items-center gap-3 mt-3">
                        <button 
                          onClick={() => handleLocalQuantityChange(ticket.ticketCode, originalQty, -1)}
                          disabled={loading}
                          className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition ${
                            loading ? "bg-gray-100 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                        >
                          -
                        </button>
                        
                        <span className={`text-sm font-bold w-12 text-center ${isChanged ? 'text-orange-500' : 'text-gray-800'}`}>
                          {currentDisplayQty} Pax
                        </span>
                        
                        <button 
                          onClick={() => handleLocalQuantityChange(ticket.ticketCode, originalQty, 1)}
                          disabled={loading}
                          className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition ${
                            loading ? "bg-gray-100 text-gray-300" : "bg-blue-100 hover:bg-blue-200 text-blue-600"
                          }`}
                        >
                          +
                        </button>

                        {isChanged && (
                          <div className="flex items-center gap-2 ml-2">
                            <button 
                              onClick={() => handleSaveQuantity(ticket.ticketCode, originalQty)}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded font-bold shadow-sm transition"
                            >
                              Simpan
                            </button>
                            <button 
                              onClick={() => handleCancelDraft(ticket.ticketCode)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded font-bold shadow-sm transition"
                            >
                              Batal
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <p className="text-gray-400 uppercase text-[10px] tracking-widest">Kode Tiket</p>
                      <p className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded mb-2">
                        {ticket.ticketCode.split('-')[0]}...
                      </p>
                      
                      <button 
                        onClick={() => handleDeleteTicket(ticket.ticketCode, originalQty)}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 border border-red-200 px-2 py-1 rounded bg-red-50"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        HAPUS TIKET
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-bold border-2 border-gray-300">QR</div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">
                        {/* Langsung render eventDate dari API */}
                        Jadwal: {ticket.eventDate}
                      </p>
                      <p className="text-[11px] text-gray-400">Harga Satuan: {ticket.price ? formatCurrency(ticket.price) : 'Gratis / TBD'}</p>
                    </div>
                  </div>
                </div>
              );
            })
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