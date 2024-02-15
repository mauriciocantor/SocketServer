

const lbl_ticket_01 = document.getElementById('lbl-ticket-01');
const lbl_desk_01 = document.getElementById('lbl-desk-01');
const table = document.querySelector('table#table_other_tickets');

function getTableInformation(workingTicket) {
    lbl_ticket_01.innerHTML = `Ticket ${workingTicket[0].number}`;
    lbl_desk_01.innerHTML = `Escritorio ${workingTicket[0].handleAtDesk}`;

    table.innerHTML = createContentTable(workingTicket);
}

async function loadInitialWorkingTickets(){
    const workingTicket = await fetch(`/api/tickets/working-on`)
        .then(resp =>resp.json());

    if(workingTicket.length <= 0){
        return
    }
    getTableInformation(workingTicket);
}

function createContentTable(workingTickets=[]){
    let tableContent = '';
    if(workingTickets<=1){
        return;
    }
    workingTickets.splice(0,1);

    for (let i = 0; i < 3; i++) {
        tableContent += `<tr>
            <td>
                <span id="lbl-ticket-0${(i + 1)}" class="ticket-secondary">${!workingTickets[i]?'':'Ticket '+workingTickets[i].number} </span>
                <br>
                <span id="lbl-desk-0${(i + 1)}">${!workingTickets[i]?'':'Escritorio '+workingTickets[i].handleAtDesk} </span>
              </td>
        </tr>`;
    }

    return tableContent;
}

function connectToWebSockets() {

    const socket = new WebSocket( 'ws://localhost:3000/ws' );

    socket.onmessage = ( event ) => {
        const payload = JSON.parse(event.data)
        if(payload.type !== 'on-working-changed') return;

        getTableInformation(payload.payload.ticketWorking);
    };

    socket.onclose = ( event ) => {
        console.log( 'Connection closed' );
        setTimeout( () => {
            console.log( 'retrying to connect' );
            connectToWebSockets();
        }, 1500 );

    };

    socket.onopen = ( event ) => {
        console.log( 'Connected' );
    };

}

connectToWebSockets();
loadInitialWorkingTickets();