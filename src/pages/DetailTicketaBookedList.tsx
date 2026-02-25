import { Link } from 'react-router-dom';

const DetailTicketBookedList = () => {
    return(
        <div>
            <h1>Detail Ticket Booked List</h1>
            <ul>
                <li><Link to="/ticket/1">Ticket 1</Link></li>
                <li><Link to="/ticket/2">Ticket 2</Link></li>
                <li><Link to="/ticket/3">Ticket 3</Link></li>
            </ul>
        </div>
    );
}

export default DetailTicketBookedList;


