import { Link } from 'react-router-dom';

const TicketBookedList = () => {
    return(
        <div>
            <h1>Ticket Booked List</h1>
            <ul>
                <li><Link to="/bookedticketlist/1">Ticket 1</Link></li>
                <li><Link to="/bookedticketlist/2">Ticket 2</Link></li>
                <li><Link to="/bookedticketlist/3">Ticket 3</Link></li>
            </ul>
        </div>
        );
    }

export default TicketBookedList;
