

const button = document.getElementById('get-new-ticket');
const createdTicketLbl = document.getElementById('lbl-new-ticket');

function updateTextTicket(response) {
    response.then((data) => {
        createdTicketLbl.innerHTML = data.number;
    });
}

const newTicket = ()=>{

    button.addEventListener('click', async (e) => {
        e.preventDefault();

        const newTicketInfo = await fetch('http://localhost:3000/api/tickets', {
            method: 'POST',
        });

        const response = newTicketInfo.json();

        updateTextTicket(response);
    });
}

const getLastTicket = async () => {
    const newTicketInfo = await fetch('http://localhost:3000/api/tickets/last');
    const response = newTicketInfo.json();

    response.then((data) => {
        createdTicketLbl.innerHTML = data;
    });
}

(async () => {
    await getLastTicket();
    newTicket();
})()