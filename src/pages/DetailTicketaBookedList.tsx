import { useParams, useNavigate } from 'react-router-dom';

const DetailTicketBookedList = () => {
  const { bookedTicketId } = useParams<{ bookedTicketId: string }>();
  const navigate = useNavigate();

  // Dummy data - nantinya data ini diambil dari API 'get booked ticket'
  const detail = {
    id: bookedTicketId,
    judul: "Konser Coldplay",
    kode: "CP-001-X",
    namaPemesan: "Calvin Aritama",
    jumlah: 2,
    totalHarga: "Rp 3.000.000",
    status: "Sudah Bayar",
    waktuTukar: "26 Feb 2026, 17:00 WIB",
    lokasi: "Gelora Bung Karno, Jakarta"
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header Navigasi */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 text-blue-600 font-medium flex items-center"
      >
        ← Kembali ke Daftar Pesanan
      </button>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-blue-600">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{detail.judul}</h1>
              <p className="text-gray-500">ID Pesanan: <span className="font-mono">{detail.id}</span></p>
            </div>
            <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold">
              {detail.status}
            </div>
          </div>

          {/* Info Utama */}
          <div className="grid grid-cols-2 gap-6 border-y border-gray-100 py-6 my-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Nama Pemesan</p>
              <p className="font-semibold text-gray-700">{detail.namaPemesan}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Jumlah Tiket</p>
              <p className="font-semibold text-gray-700">{detail.jumlah} Tiket</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Lokasi</p>
              <p className="font-semibold text-gray-700">{detail.lokasi}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Waktu Penukaran</p>
              <p className="font-semibold text-gray-700">{detail.waktuTukar}</p>
            </div>
          </div>

          {/* Area Kode QR / Barcode Dummy */}
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="w-40 h-40 bg-gray-300 flex items-center justify-center text-gray-500 mb-2">
              [QR CODE]
            </div>
            <p className="text-lg font-mono font-bold tracking-[0.5em]">{detail.kode}</p>
            <p className="text-xs text-gray-400 mt-1 text-center">Tunjukkan QR Code ini kepada petugas di lokasi untuk melakukan check-in.</p>
          </div>
        </div>

        {/* Footer Detail */}
        <div className="bg-gray-800 p-6 flex justify-between items-center text-white">
          <div>
            <p className="text-xs text-gray-400">Total Pembayaran</p>
            <p className="text-xl font-bold">{detail.totalHarga}</p>
          </div>
          <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailTicketBookedList;