import React from 'react';
import App from './App';
import { Link } from 'react-router-dom';

const TicketList = () => {
    return(
        <div>
            <h1>Ticket List</h1>
            <ul>
                <li><Link to="/ticket/1">Ticket 1</Link></li>
                <li><Link to="/ticket/2">Ticket 2</Link></li>
                <li><Link to="/ticket/3">Ticket 3</Link></li>
            </ul>
        </div> 
    );
}

export default App;
