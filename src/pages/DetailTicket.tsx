import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from './Cart'; 
import '../css/DetailTicket.css'; // Memanggil CSS baru

// 1. Definisikan interface
interface TicketDetail {
  ticketCode: string;
  ticketName: string;
  categoryName: string;
  quota: number;
  price: number;
  eventDateStart: string;
  eventDateEnd: string;
}

const DetailTicket = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate(); 
    
    // Panggil fungsi addToCart dari Context
    const { addToCart } = useCart(); 
    
    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    
    // State untuk loading spesifik saat klik "Pesan Langsung"
    const [isBooking, setIsBooking] = useState(false);

    // 2. Fetch data spesifik berdasarkan ID
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`http://localhost:5287/api/v1/get-available-ticket`);
                const data: TicketDetail[] = await response.json();
                
                const foundTicket = data.find(t => t.ticketCode === id);
                setTicket(foundTicket || null);
            } catch (error) {
                console.error("Gagal memuat detail tiket:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) {
            fetchDetail();
        }
    }, [id]);

    const formatIDR = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    // HANDLER 1: Tambah ke Keranjang
    const handleAddToCart = () => {
        if (!ticket) {
            return;
        }
        const isEventStarted = new Date(ticket.eventDateStart) <= new Date();
        if (isEventStarted) {
            alert("Maaf, tiket yang dipesan sudah lewat masa waktu.");
            return;
        }

        addToCart({
            ticketCode: ticket.ticketCode,
            ticketName: ticket.ticketName,
            categoryName: ticket.categoryName,
            price: ticket.price,
            quantity: quantity
        });
    };

    // HANDLER 2: Pesan Langsung
    const handleBookNow = async () => {
        if (!ticket) {
            return;
        }
        const isEventStarted = new Date(ticket.eventDateStart) <= new Date();
        if (isEventStarted) {
            alert("Maaf, tiket yang dipesan sudah lewat masa waktu.");
            return;
        }

        try {
            setIsBooking(true);
            const payload = {
                tickets: [{ ticketCode: ticket.ticketCode, quantity: quantity }]
            };

            const response = await fetch('http://localhost:5287/api/v1/book-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Pesanan berhasil dibuat!');
                navigate('/bookedticketlist');
            } else {
                const errorData = await response.json().catch(() => null);
                if (response.status === 400) {
                    alert("Maaf, tiket yang dipesan sudah lewat masa waktu atau kuota tidak mencukupi.");
                } else {
                    alert('Gagal membuat pesanan. Silakan coba lagi.');
                }
            }
        } catch (error) {
            alert('Terjadi kesalahan sistem. Tidak dapat terhubung ke server.');
        } finally {
            setIsBooking(false);
        }
    };
    
    if (isLoading) {
        return <div className="dt-status">Memuat detail tiket...</div>;
    }

    if (!ticket) {
        return <div className="dt-status">Tiket tidak ditemukan.</div>;
    }
    
    return (
        <div className="dt-container">
            {/* Banner Section */}
            <div className="dt-banner">
                <span className="dt-banner-category">{ticket.categoryName}</span>
                <h1 className="dt-banner-title">{ticket.ticketName}</h1>
            </div>

            {/* Content Container */}
            <div className="dt-content-card">
                
                <div className="dt-header-section">
                    <div className="dt-header-row">
                        <div>
                            <span className="dt-badge">
                                {ticket.categoryName}
                            </span>
                            <h1 className="dt-title">
                                {ticket.ticketName}
                            </h1>
                        </div>
                        <div className="dt-quota-container">
                             <p className="dt-quota-label">Sisa Kuota</p>
                             <p className="dt-quota-value">{ticket.quota} Tiket</p>
                        </div>
                    </div>
                    <div className="dt-dates">
                        <p>📅 Mulai: {new Date(ticket.eventDateStart).toLocaleString('id-ID')}</p>
                        <p>🏁 Selesai: {new Date(ticket.eventDateEnd).toLocaleString('id-ID')}</p>
                    </div>
                </div>

                <hr className="dt-divider" />

                <div className="dt-description">
                    <h2 className="dt-description-title">Deskripsi Tiket</h2>
                    <p className="dt-description-text">
                        Tiket untuk <strong>{ticket.ticketName}</strong> kategori <strong>{ticket.categoryName}</strong>. 
                        Gunakan kode referensi <code>{ticket.ticketCode}</code> untuk informasi lebih lanjut saat check-in di lokasi acara.
                    </p>
                </div>

                {/* Pricelist Card */}
                <div className="dt-price-card">
                    <p className="dt-price-label">Harga per tiket</p>
                    <div className="dt-price-value">{formatIDR(ticket.price)}</div>
                </div>

                {/* Section Pembelian */}
                <div className="dt-actions-row">
                    {/* Input Jumlah */}
                    <div className="dt-qty-selector">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1 || isBooking}
                            className="dt-qty-btn"
                        >-</button>
                        <div className="dt-qty-value">
                            {quantity}
                        </div>
                        <button 
                            onClick={() => setQuantity(Math.min(ticket.quota, quantity + 1))}
                            disabled={quantity >= ticket.quota || isBooking}
                            className="dt-qty-btn"
                        >+</button>
                    </div>

                    {/* Tombol Aksi Kanan */}
                    <div className="dt-buttons-container">
                        {/* Tombol Keranjang (Outline) */}
                        <button 
                            onClick={handleAddToCart}
                            disabled={isBooking}
                            className="dt-btn-outline"
                        >        
                            + Keranjang
                        </button>

                        {/* Tombol Pesan Langsung (Solid) */}
                        <button 
                            onClick={handleBookNow}
                            disabled={isBooking}
                            className={`dt-btn-solid ${isBooking ? 'booking' : ''}`}
                        >        
                            {isBooking ? 'Memproses...' : `Beli (${formatIDR(ticket.price * quantity)})`}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default DetailTicket;