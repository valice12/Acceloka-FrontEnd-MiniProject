import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../css/DetailTicketBookedList.css'; 

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

interface TicketMaster {
  ticketCode: string;
  price: number;
}

const DetailTicketBookedList = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const location = useLocation();

  // Menangkap purchaseDate yang dikirim dari halaman list sebelumnya
  const purchaseDateFromState = location.state?.purchaseDate;

  // 2. State
  const [orderCategories, setOrderCategories] = useState<BookedCategory[]>([]);
  const [ticketMaster, setTicketMaster] = useState<TicketMaster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});

  const fetchDetailData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch detail pesanan dan data master (untuk ambil harga) secara paralel
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

  // Helper mencari harga
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

  // Kalkulasi total bayar menggunakan harga dari master data
  const totalBayar = useMemo(() => {
    return orderCategories.reduce((acc, category) => {
      const price = getPriceByCode(category.tickets[0]?.ticketCode);
      return acc + (price * category.quantityPerCategory);
    }, 0);
  }, [orderCategories, ticketMaster]);

  if (loading && orderCategories.length === 0) {
    return <div className="detail-status">Memuat Detail Pesanan...</div>;
  }

  if (error || orderCategories.length === 0) {
    return <div className="detail-status detail-error">{error || "Data kosong"}</div>;
  }

  const handleLocalQuantityChange = (ticketCode: string, originalQty: number, delta: number) => {
    const currentQty = draftQuantities[ticketCode] !== undefined ? draftQuantities[ticketCode] : originalQty;
    const newQuantity = currentQty + delta;

    if (newQuantity < 1) {
      alert("Jumlah tiket minimal adalah 1.");
      return;
    }

    setDraftQuantities((prev) => {
      return { ...prev, [ticketCode]: newQuantity };
    });
  };

  const handleSaveQuantity = async (ticketCode: string, originalQty: number) => {
    const newQuantity = draftQuantities[ticketCode];
    
    if (!newQuantity || newQuantity === originalQty) {
      return;
    }

    if (window.confirm(`Yakin ingin mengubah jumlah menjadi ${newQuantity}?`)) {
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
          alert("Berhasil diperbarui.");
          setDraftQuantities((prev) => {
            const newState = { ...prev };
            delete newState[ticketCode];
            return newState;
          });
          await fetchDetailData(); 
        } else {
          alert("Gagal memperbarui tiket.");
        }
      } catch (err) {
        alert("Terjadi kesalahan sistem.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteTicket = async (ticketCode: string, currentQuantity: number) => {
    if (window.confirm("Lanjutkan hapus tiket?")) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5287/api/v1/revoke-ticket/${id}/${ticketCode}/${currentQuantity}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert("Tiket berhasil dihapus.");
          await fetchDetailData(); 
        }
      } catch (err) {
        alert("Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="detail-container">
      <button onClick={() => { navigate(-1); }} className="detail-back-btn">
        ← Kembali ke Daftar Pesanan
      </button>

      <div className="detail-wrapper">
        <div className="detail-header">
          <div className="detail-header-left">
            <h1 className="detail-title">Detail Pesanan</h1>
            <p className="detail-id">ID: {id}</p>
            {/* Tampilan purchaseDate yang diparse dari list */}
            <p className="detail-purchase-date">
              Dibeli pada: <strong>{formatDateTime(purchaseDateFromState)}</strong>
            </p>
          </div>
          <span className="detail-status-badge">PAID / LUNAS</span>
        </div>

        <div className="detail-ticket-list">
          {orderCategories.map((category, catIndex) => {
            return category.tickets.map((ticket, tIndex) => {
              const originalQty = category.quantityPerCategory;
              const currentDisplayQty = draftQuantities[ticket.ticketCode] !== undefined 
                ? draftQuantities[ticket.ticketCode] 
                : originalQty;
              const isChanged = currentDisplayQty !== originalQty;
              const unitPrice = getPriceByCode(ticket.ticketCode);

              return (
                <div key={ticket.ticketCode} className="detail-card">
                  <div className="detail-card-top">
                    <div className="detail-card-info">
                      <h2 className="detail-card-title">
                        Tiket #{catIndex + 1}.{tIndex + 1} - <span className="detail-card-category">{category.categoryName}</span>
                      </h2>
                      <h3 className="detail-ticket-name">{ticket.ticketName}</h3>
                      
                      <div className="detail-qty-controls">
                        <button 
                          onClick={() => { handleLocalQuantityChange(ticket.ticketCode, originalQty, -1); }}
                          disabled={loading}
                          className="qty-btn"
                        > - </button>
                        
                        <span className={`qty-text ${isChanged ? 'qty-changed' : ''}`}>
                          {currentDisplayQty} Pax
                        </span>
                        
                        <button 
                          onClick={() => { handleLocalQuantityChange(ticket.ticketCode, originalQty, 1); }}
                          disabled={loading}
                          className="qty-btn"
                        > + </button>

                        {isChanged && (
                          <div className="qty-actions">
                            <button onClick={() => { handleSaveQuantity(ticket.ticketCode, originalQty); }} className="qty-save-btn">Simpan</button>
                            <button onClick={() => { setDraftQuantities({}); }} className="qty-cancel-btn">Batal</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="detail-card-right">
                      <p className="detail-code-label">Kode Tiket</p>
                      <p className="detail-code-value">
                        {ticket.ticketCode.substring(0, 8)}...
                      </p>
                      
                      <button 
                        onClick={() => { handleDeleteTicket(ticket.ticketCode, originalQty); }}
                        className="detail-delete-btn"
                      >
                        HAPUS
                      </button>
                    </div>
                  </div>
                  
                  <div className="detail-card-bottom">
                    <div className="detail-qr-placeholder">QR</div>
                    <div className="detail-price-info">
                      <p className="detail-date-text">Jadwal: {ticket.eventDate}</p>
                      <p className="detail-price-text">Harga Satuan: {formatCurrency(unitPrice)}</p>
                      <p className="detail-subtotal-text">Subtotal: {formatCurrency(unitPrice * currentDisplayQty)}</p>
                    </div>
                  </div>
                </div>
              );
            });
          })}
        </div>

        <div className="detail-footer">
          <div className="footer-info">
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