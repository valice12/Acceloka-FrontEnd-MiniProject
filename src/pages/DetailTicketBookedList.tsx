import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/DetailTicketBookedList.css'; // Memanggil CSS baru

// 1. Definisikan Interface
interface TicketDetail {
  ticketCode: string;
  ticketName: string;
  eventDate: string;
  price?: number; 
}

interface BookedCategory {
  quantityPerCategory: number;
  categoryName: string;
  tickets: TicketDetail[];
}

const DetailTicketBookedList = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();

  // 2. State
  const [orderCategories, setOrderCategories] = useState<BookedCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});

  const fetchDetailData = useCallback(async () => {
    try {
      setLoading(true);
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
// Kalkulasi total
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
    <div className="detail-container">
      <button onClick={() => navigate(-1)} className="detail-back-btn">
        ← Kembali ke Daftar Pesanan
      </button>

      <div className="detail-wrapper">
        <div className="detail-header">
          <div>
            <h1 className="detail-title">Detail Pesanan</h1>
            <p className="detail-id">ID: {id}</p>
          </div>
          <span className="detail-status-badge">Status Pembayaran</span>
        </div>

       <div className="detail-ticket-list">
         {orderCategories.map((category, catIndex) => (
           category.tickets.map((ticket, tIndex) => {
             const originalQty = category.quantityPerCategory;
             const currentDisplayQty = draftQuantities[ticket.ticketCode] !== undefined 
               ? draftQuantities[ticket.ticketCode] 
               : originalQty;
             const isChanged = currentDisplayQty !== originalQty;

             return (
               <div key={ticket.ticketCode} className="detail-card">
                 <div className="detail-card-top">
                   <div>
                     <h2 className="detail-card-title">
                       Tiket #{catIndex + 1}.{tIndex + 1} - <span className="detail-card-category">{category.categoryName}</span>
                     </h2>
                     <h3 className="detail-ticket-name">{ticket.ticketName}</h3>
                     
                     {/* Kontrol Jumlah Tiket */}
                     <div className="detail-qty-controls">
                       <button 
                         onClick={() => handleLocalQuantityChange(ticket.ticketCode, originalQty, -1)}
                         disabled={loading}
                         className={`qty-btn qty-btn-minus ${loading ? "disabled" : ""}`}
                       >
                         -
                       </button>
                       
                       <span className={`qty-text ${isChanged ? 'qty-changed' : ''}`}>
                         {currentDisplayQty} Pax
                       </span>
                       
                       <button 
                         onClick={() => handleLocalQuantityChange(ticket.ticketCode, originalQty, 1)}
                         disabled={loading}
                         className={`qty-btn qty-btn-plus ${loading ? "disabled" : ""}`}
                       >
                         +
                       </button>

                       {isChanged && (
                         <div className="qty-actions">
                           <button onClick={() => handleSaveQuantity(ticket.ticketCode, originalQty)} className="qty-save-btn">
                             Simpan
                           </button>
                           <button onClick={() => handleCancelDraft(ticket.ticketCode)} className="qty-cancel-btn">
                             Batal
                           </button>
                         </div>
                       )}
                     </div>
                   </div>

                   <div className="detail-card-right">
                     <p className="detail-code-label">Kode Tiket</p>
                     <p className="detail-code-value">
                       {ticket.ticketCode.split('-')[0]}...
                     </p>
                     
                     <button 
                       onClick={() => handleDeleteTicket(ticket.ticketCode, originalQty)}
                       className="detail-delete-btn"
                     >
                       <svg className="delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                       HAPUS TIKET
                     </button>
                   </div>
                 </div>
                 
                 <div className="detail-card-bottom">
                   <div className="detail-qr-placeholder">QR</div>
                   <div>
                     <p className="detail-date-text">
                       Jadwal: {ticket.eventDate}
                     </p>
                     <p className="detail-price-text">Harga Satuan: {ticket.price ? formatCurrency(ticket.price) : 'Gratis / TBD'}</p>
                   </div>
                 </div>
               </div>
             );
           })
         ))}
       </div>

        <div className="detail-footer">
          <div>
            <p className="footer-label">Total Pembayaran</p>
            <p className="footer-total">{formatCurrency(totalBayar)}</p>
          </div>
          <button className="footer-download-btn">Download PDF</button>
        </div>
      </div>
    </div>
  );
};

export default DetailTicketBookedList;