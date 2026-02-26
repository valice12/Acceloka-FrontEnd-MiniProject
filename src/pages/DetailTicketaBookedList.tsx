import { useParams, useNavigate } from 'react-router-dom';

const DetailTicketBookedList = () => {
  const { bookedTicketId } = useParams<{ bookedTicketId: string }>();
  const navigate = useNavigate();

  // Dummy data yang mencakup daftar banyak tiket dalam satu pesanan
  const orderDetail = {
    id: bookedTicketId,
    namaPemesan: "Calvin Aritama", //
    status: "Sudah Bayar",
    totalPembayaran: "Rp 4.500.000",
    // Ini adalah array tiket yang dibeli dalam satu transaksi
    tickets: [
      { 
        id: "T-001", 
        judul: "Konser Coldplay", 
        kode: "CP-LND-01", 
        waktu: "26 Feb 2026", 
        lokasi: "GBK, Jakarta",
        harga: "Rp 1.500.000"
      },
      { 
        id: "T-002", 
        judul: "Seminar Tech 2026", 
        kode: "ST-MJK-05", 
        waktu: "27 Feb 2026", 
        lokasi: "ICE BSD, Tangerang",
        harga: "Rp 3.000.000"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 text-blue-600 font-medium flex items-center hover:underline"
      >
        ← Kembali ke Daftar Pesanan
      </button>

      <div className="max-w-3xl mx-auto">
        {/* Ringkasan Pesanan */}
        <div className="bg-white p-6 rounded-t-2xl border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Detail Pesanan #{orderDetail.id}</h1>
            <p className="text-sm text-gray-500 text-left">Pemesan: {orderDetail.namaPemesan}</p>
          </div>
          <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold">
            {orderDetail.status}
          </span>
        </div>

        {/* Looping semua tiket yang ada dalam pesanan ini */}
        <div className="space-y-4 mt-4">
          {orderDetail.tickets.map((ticket, index) => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-md overflow-hidden border-l-8 border-blue-500 text-left">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-bold text-blue-600">{ticket.judul}</h2>
                  <span className="text-xs font-mono text-gray-400">TICKET {index + 1}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-gray-400 uppercase text-[10px] tracking-widest text-left">Waktu & Lokasi</p>
                    <p className="font-medium text-gray-700 text-left">{ticket.waktu}</p>
                    <p className="text-gray-500 text-left">{ticket.lokasi}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-gray-400 uppercase text-[10px] tracking-widest">Kode Tiket</p>
                    <p className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                      {ticket.kode}
                    </p>
                  </div>
                </div>

                {/* QR Code Mini untuk tiap tiket */}
                <div className="mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-500">QR</div>
                  <p className="text-[11px] text-gray-400">Scan QR ini pada pintu masuk venue sesuai dengan jadwal yang tertera.</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Pembayaran di bagian paling bawah */}
        <div className="mt-6 bg-gray-800 p-6 rounded-xl flex justify-between items-center text-white shadow-lg">
          <div>
            <p className="text-xs text-gray-400 text-left">Total Pembayaran ({orderDetail.tickets.length} Tiket)</p>
            <p className="text-xl font-bold">{orderDetail.totalPembayaran}</p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-bold transition">
            Download Semua PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailTicketBookedList;