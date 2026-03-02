import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Cart.css'; // Memanggil file CSS baru

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
                <div className="cart-overlay">
                    {/* Background Gelap (Klik untuk tutup) */}
                    <div 
                        className="cart-backdrop"
                        onClick={() => setIsCartOpen(false)}
                    ></div>

                    {/* Sidebar Keranjang */}
                    <div className="cart-sidebar">
                        <div className="cart-header">
                            <h2 className="cart-title">Keranjang Pesanan</h2>
                            <button onClick={() => setIsCartOpen(false)} className="cart-close-btn">✕</button>
                        </div>

                        <div className="cart-body">
                            {cartItems.length === 0 ? (
                                <p className="cart-empty-text">Keranjang Anda masih kosong.</p>
                            ) : (
                                cartItems.map((item, index) => (
                                    <div key={index} className="cart-item">
                                        <div className="cart-item-details">
                                            <p className="cart-item-category">{item.categoryName}</p>
                                            <p className="cart-item-name">{item.ticketName}</p>
                                            <p className="cart-item-price">{item.quantity}x @ {formatIDR(item.price)}</p>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.ticketCode)}
                                            className="cart-delete-btn"
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
                            <div className="cart-footer">
                                <div className="cart-total-row">
                                    <p className="cart-total-label">Total Pembayaran</p>
                                    <p className="cart-total-value">{formatIDR(totalBayar)}</p>
                                </div>
                                <button 
                                    onClick={handleCheckout}
                                    disabled={isBooking}
                                    className={`cart-checkout-btn ${isBooking ? 'disabled' : 'active'}`}
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