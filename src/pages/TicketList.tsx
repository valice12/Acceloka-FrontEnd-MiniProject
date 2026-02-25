import { Link } from 'react-router-dom';
import { textChangeRangeIsUnchanged } from 'typescript';

// const TicketList = () => {
//     const showTicket = () => {
//         return Array.from({length:3}).map((_, i) => (
//             <li key={i} className="mb-3 list-none">
//                 <Link to='/ticket/${i + 1}'>
//                     Ticket {i + 1}
//                      <div className="flex w-full bg-gray-200">
//                         <div className="flex items-center bg-gray-400 mr-4 pr-4 pl-4 h-[120px]"> picture nanti nya di sebelah kiri </div>
//                         <div className="pr-4 pl-4 bg-blue-100 flex-1">
//                             <div className="Nama Ticket">Judul</div>
//                             <div className="kodeticket">KODE TICKET</div>
//                             <div className="hargaticket">Harga Ticket</div>
//                             <div className="rangewaktu">Range Waktu</div>
//                         </div>
//                     </div>
//                 </Link>
//             </li>
//         ));
//     };

//     return(
//         <div className="p-4">
//             <h1 className="text-2xl font-bold mb-4"> Ticket List</h1>
//             <ul>
//                 {showTicket()}
//             </ul>
//
// terus nanti di sini dikasih tombol keranjang supaya bisa multiple buy 
// berarti bikin poolnya dulu
// terus nanti kita masukin datanya ke pool
// terus nanti kita oper ke post-ticket
//         </div>
//     );
// };


const TicketList = () => {
  // 1. Buat data dummy dalam bentuk Array
  const dummyTickets = [
    { id: 1, judul: "Konser Coldplay", kode: "CP-001", harga: "Rp 1.500.000", waktu: "19:00 - 22:00" },
    { id: 2, judul: "Final Liga Champions", kode: "UCL-099", harga: "Rp 5.000.000", waktu: "02:00 - 05:00" },
    { id: 3, judul: "Seminar Tech 2026", kode: "ST-202", harga: "Gratis", waktu: "09:00 - 12:00" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ticket List</h1>
      <ul className="space-y-4"> {/* Menambah jarak antar list */}
        {/* 2. Lakukan looping menggunakan .map() */}
        {dummyTickets.map((ticket) => (
          <li key={ticket.id} className="list-none">
            <Link to={`/ticket/${ticket.id}`} className="block hover:opacity-80">
              <div className="flex w-full bg-gray-200 border border-gray-300">
                {/* Bagian Gambar */}
                <div className="flex items-center justify-center bg-gray-400 w-[120px] h-[120px] text-center text-xs p-2">
                  Picture
                </div>
                
                {/* Bagian Penjelasan */}
                <div className="flex-1 pr-4 pl-4 bg-blue-100 flex flex-col justify-center">
                  <div className="font-bold text-lg">{ticket.judul}</div>
                  <div className="text-sm text-gray-600 italic">{ticket.kode}</div>
                  <div className="text-blue-700 font-semibold">{ticket.harga}</div>
                  <div className="text-gray-500 text-sm">{ticket.waktu}</div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TicketList;
