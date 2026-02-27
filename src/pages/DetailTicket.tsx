import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Kembalikan useNavigate
import { useCart } from './Cart'; // Pastikan path ini sesuai

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
    const navigate = useNavigate(); // Inisialisasi navigate
    
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

    // HANDLER 1: Tambah ke Keranjang (Hanya state lokal Front-End)
    const handleAddToCart = () => {
        if (!ticket) return;

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

    // HANDLER 2: Pesan Langsung (Langsung POST API)
    const handleBookNow = async () => {
        if (!ticket) return;

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
    
    if (isLoading) return <div className="p-10 text-center">Memuat detail tiket...</div>;
    if (!ticket) return <div className="p-10 text-center">Tiket tidak ditemukan.</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative pb-24 text-left">
            {/* Banner Section */}
            <div className="w-full bg-blue-600 h-[200px] flex flex-col items-center justify-center text-white shadow-inner p-4 text-center">
                <span className="text-sm uppercase tracking-widest opacity-80 mb-2">{ticket.categoryName}</span>
                <h1 className="text-2xl md:text-4xl font-black uppercase">{ticket.ticketName}</h1>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto w-full p-6 bg-white shadow-sm mt-[-40px] rounded-t-3xl z-10">
                
                <div className="mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                {ticket.categoryName}
                            </span>
                            <h1 className="text-3xl font-extrabold text-gray-800 mt-2">
                                {ticket.ticketName}
                            </h1>
                        </div>
                        <div className="text-right">
                             <p className="text-xs text-gray-400 uppercase">Sisa Kuota</p>
                             <p className="text-lg font-bold text-orange-500">{ticket.quota} Tiket</p>
                        </div>
                    </div>
                    <div className="text-gray-500 mt-4 flex flex-col gap-1 text-sm">
                        <p>📅 Mulai: {new Date(ticket.eventDateStart).toLocaleString('id-ID')}</p>
                        <p>🏁 Selesai: {new Date(ticket.eventDateEnd).toLocaleString('id-ID')}</p>
                    </div>
                </div>

                <hr className="border-gray-100 mb-6" />

                <div className="mb-8">
                    <h2 className="font-bold text-lg text-gray-700 mb-2 text-left">Deskripsi Tiket</h2>
                    <p className="text-gray-600 leading-relaxed text-left">
                        Tiket untuk <strong>{ticket.ticketName}</strong> kategori <strong>{ticket.categoryName}</strong>. 
                        Gunakan kode referensi <code>{ticket.ticketCode}</code> untuk informasi lebih lanjut saat check-in di lokasi acara.
                    </p>
                </div>

                {/* Pricelist Card */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-10">
                    <p className="text-sm text-gray-500 italic">Harga per tiket</p>
                    <div className="text-3xl font-black text-blue-600">{formatIDR(ticket.price)}</div>
                </div>

                {/* Section Pembelian */}
                <div className="flex items-center justify-between bg-white border-t border-gray-100 pt-6">
                    {/* Input Jumlah */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shrink-0">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1 || isBooking}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition font-bold"
                        >-</button>
                        <div className="px-4 py-2 font-semibold text-gray-700 w-12 text-center">
                            {quantity}
                        </div>
                        <button 
                            onClick={() => setQuantity(Math.min(ticket.quota, quantity + 1))}
                            disabled={quantity >= ticket.quota || isBooking}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition font-bold"
                        >+</button>
                    </div>

                    {/* Tombol Aksi Kanan */}
                    <div className="flex flex-1 ml-6 gap-3">
                        {/* Tombol Keranjang (Outline) */}
                        <button 
                            onClick={handleAddToCart}
                            disabled={isBooking}
                            className="flex-1 font-bold py-3 rounded-xl transition text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 text-sm md:text-base"
                        >        
                            + Keranjang
                        </button>

                        {/* Tombol Pesan Langsung (Solid) */}
                        <button 
                            onClick={handleBookNow}
                            disabled={isBooking}
                            className={`flex-1 font-bold py-3 rounded-xl transition shadow-lg text-center text-sm md:text-base ${
                                isBooking 
                                ? 'bg-blue-400 text-white cursor-not-allowed shadow-none' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                            }`}
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