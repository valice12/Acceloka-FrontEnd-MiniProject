import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DetailTicket = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative pb-24">
            {/* Banner Section */}
            <div className="w-full bg-gray-300 h-[200px] flex items-center justify-center text-gray-600 font-bold uppercase tracking-widest shadow-inner">
                Banner Image / Header
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto w-full p-6 bg-white shadow-sm mt-[-20px] rounded-t-3xl z-10">
                
                {/* Judul & Kategori */}
                <div className="mb-6">
                    <span className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        Entertainment
                    </span>
                    <h1 className="text-3xl font-extrabold text-gray-800 mt-2">
                        Judul Tiket Spektakuler {ticketId}
                    </h1>
                    <p className="text-gray-500 mt-1 flex items-center">
                        📅 25 - 27 Februari 2026
                    </p>
                </div>

                <hr className="border-gray-100 mb-6" />

                {/* Deskripsi */}
                <div className="mb-8">
                    <h2 className="font-bold text-lg text-gray-700 mb-2">Deskripsi</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Ini adalah deskripsi tiket yang menjelaskan detail acara. Nikmati pengalaman tak terlupakan dengan fasilitas terbaik yang kami sediakan khusus untuk Anda.
                    </p>
                </div>

                {/* Pricelist Card */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-10">
                    <p className="text-sm text-gray-500 italic">Harga per tiket</p>
                    <div className="text-2xl font-bold text-blue-600">Rp 750.000</div>
                </div>

                {/* Section Pembelian - Floating di bawah atau di tengah */}
                <div className="flex items-center justify-between bg-white border-t border-gray-100 pt-6">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition font-bold"
                        >-</button>
                        <div className="px-6 py-2 font-semibold text-gray-700 w-12 text-center">
                            {quantity}
                        </div>
                        <button 
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition font-bold"
                        >+</button>
                    </div>

                    <button 
                        onClick={() => navigate('/booked')}
                        className="flex-1 ml-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200 text-center"
                    >
                        Pesan Sekarang
                    </button>
                </div>
            </div>

            {/* Footer - Menempel di bawah jika konten sedikit */}
            <footer className="mt-auto w-full py-6 bg-gray-800 text-gray-400 text-center text-sm">
                &copy; 2026 TicketApp. All rights reserved.
            </footer>
        </div>
    );
}

export default DetailTicket;