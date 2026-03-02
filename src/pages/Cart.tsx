import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// --- 1. INTERFACE & TIPE DATA ---
export interface CartItem {
    ticketCode: string;
    ticketName: string;
    categoryName: string;
    price: number;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (ticketCode: string) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
}

// --- 2. INISIALISASI CONTEXT ---
const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart harus digunakan di dalam CartProvider");
    }
    return context;
};

// --- 3. PROVIDER & OVERLAY UI (Komponen Utama) ---
export const CartProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    
    // State Keranjang (Ambil dari LocalStorage jika ada)
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('bookingCart');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    // Simpan ke LocalStorage setiap kali cartItems berubah
    useEffect(() => {
        localStorage.setItem('bookingCart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Fungsi Tambah Keranjang
    const addToCart = (newItem: CartItem) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.ticketCode === newItem.ticketCode);
            if (existingItem) {
                // Jika tiket sudah ada, tambahkan quantity-nya
                return prev.map(item => 
                    item.ticketCode === newItem.ticketCode 
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }
            // Jika belum ada, masukkan sebagai tiket baru
            return [...prev, newItem];
        });
        setIsCartOpen(true); // Otomatis buka keranjang saat ditambah
    };

    // Fungsi Hapus Item dari Keranjang
    const removeFromCart = (ticketCode: string) => {
        setCartItems(prev => prev.filter(item => item.ticketCode !== ticketCode));
    };

    const clearCart = () => setCartItems([]);

    const totalBayar = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Format Rupiah
    const formatIDR = (price: number) => 
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    // Fungsi Checkout ke API
    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            return;
        }

        try {
            setIsBooking(true);
            
            // Format payload sesuai API
            const payload = {
                tickets: cartItems.map(item => ({
                    ticketCode: item.ticketCode,
                    quantity: item.quantity
                }))
            };

            const response = await fetch('http://localhost:5287/api/v1/book-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Pesanan berhasil dibuat!');
                clearCart();
                setIsCartOpen(false);
                navigate('/bookedticketlist');
            } else {
                const errorData = await response.json().catch(() => null);
                if (response.status === 400) {
                    alert("Gagal: Tiket mungkin sudah lewat masa waktu atau kuota habis.");
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

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, isCartOpen, setIsCartOpen }}>
            {/* Aplikasi Utama (TicketList, DetailTicket, dll) akan dirender di sini */}
            {children}

            {/* --- OVERLAY UI KERANJANG --- */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Background Gelap (Klik untuk tutup) */}
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={() => setIsCartOpen(false)}
                    ></div>

                    {/* Sidebar Keranjang */}
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
                            <h2 className="text-xl font-bold">Keranjang Pesanan</h2>
                            <button onClick={() => setIsCartOpen(false)} className="text-white hover:text-gray-200 font-bold text-xl">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                            {cartItems.length === 0 ? (
                                <p className="text-center text-gray-400 mt-10">Keranjang Anda masih kosong.</p>
                            ) : (
                                cartItems.map((item, index) => (
                                    <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-blue-500 font-bold uppercase">{item.categoryName}</p>
                                            <p className="font-bold text-gray-800">{item.ticketName}</p>
                                            <p className="text-sm text-gray-500">{item.quantity}x @ {formatIDR(item.price)}</p>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.ticketCode)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                            title="Hapus Tiket"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Bagian Bawah: Total & Tombol Konfirmasi */}
                        {cartItems.length > 0 && (
                            <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-gray-500">Total Pembayaran</p>
                                    <p className="text-xl font-black text-blue-600">{formatIDR(totalBayar)}</p>
                                </div>
                                <button 
                                    onClick={handleCheckout}
                                    disabled={isBooking}
                                    className={`w-full py-3 rounded-xl font-bold text-white transition ${
                                        isBooking ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200'
                                    }`}
                                >
                                    {isBooking ? 'Memproses...' : 'Konfirmasi Pesanan'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </CartContext.Provider>
    );
};