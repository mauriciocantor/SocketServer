

const lblPending = document.getElementById('lbl-pending');
const deskLabel = document.getElementById('name-desk');
const noMoreAlert = document.querySelector('.alert');
const lblCurrentTicket = document.querySelector('small');

const btnDraw = document.getElementById('btn-draw');
const btnDone = document.getElementById('btn-done');

const searchParams = new URLSearchParams(window.location.search);

if(!searchParams.has('escritorio')){
    window.location = ' index.html';
    throw new Error('Escritorio es requerido');
}

const deskNumber = searchParams.get('escritorio');
let currentTicket = null;


deskLabel.innerHTML = `Escritorio ${deskNumber}`;


function checkTicketCount( currentCount = 0){
    if (currentCount === 0){
        noMoreAlert.classList.remove('d-none');
    }else {
        noMoreAlert.classList.add('d-none');
    }
    lblPending.innerHTML = currentCount;
}


async function loadInitialCount(){
    const pending = await fetch('/api/tickets/pending').then(resp=>resp.json());

    checkTicketCount(pending.length);
}

async function getTicket(){
    await finishTicket();
    const {status, ticket, message} = await fetch(`/api/tickets/draw/${deskNumber}`)
        .then(resp =>resp.json());

    if (status==='error'){
        lblCurrentTicket.innerHTML = message;
    }

    currentTicket = ticket;
    lblCurrentTicket.innerHTML= ticket.number;
}

async function finishTicket(){
    if(!currentTicket) return;
    const {status, message} = await fetch(`/api/tickets/done/${currentTicket.id}`, {
        method:'PUT'
    })
        .then(resp =>resp.json());

    if (status==='error'){
        lblCurrentTicket.innerHTML = message;
    }

    lblCurrentTicket.innerHTML= '...';
}



function connectToWebSockets() {

    const socket = new WebSocket( 'ws://localhost:3000/ws' );

    socket.onmessage = ( event ) => {
        const payload = JSON.parse(event.data)
        if(payload.type !== 'on-ticket-count-changed') return;

        checkTicketCount(payload.payload.ticket);
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

btnDraw.addEventListener('click', getTicket);
btnDone.addEventListener('click', finishTicket);

connectToWebSockets();
loadInitialCount();