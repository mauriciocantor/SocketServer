import {TicketInterface} from "../../domain/interfaces/ticket.interface";
import {UuidAdapter} from "../../config/uuid.adapter";
import {WssService} from "./wss.service";


export class TicketService {

    constructor(
        private readonly wssService = WssService.instance
    ) {
    }

    public tickets: TicketInterface[] = [
        { id: UuidAdapter.v4(), number: 1, createdAt: new Date(), done:false },
        { id: UuidAdapter.v4(), number: 2, createdAt: new Date(), done:false },
        { id: UuidAdapter.v4(), number: 3, createdAt: new Date(), done:false },
        { id: UuidAdapter.v4(), number: 4, createdAt: new Date(), done:false },
        { id: UuidAdapter.v4(), number: 5, createdAt: new Date(), done:false },
        { id: UuidAdapter.v4(), number: 6, createdAt: new Date(), done:false },
    ];

    private readonly workingOnTickets: TicketInterface[]=[];

    public get pendingTickets():TicketInterface[]{
        return this.tickets.filter(ticket => !ticket.handleAtDesk );
    }

    public get lastWorkingOnTickets():TicketInterface[]{
        return this.workingOnTickets.slice(0,4);
    }

    public get lastTicketNumber():number{
        return this.tickets.length > 0 ? this.tickets.at(-1)!.number : 0 ;
    }

    public createTicket():TicketInterface{
        const ticket:TicketInterface = {
            id: UuidAdapter.v4(),
            number: (this.lastTicketNumber + 1),
            createdAt: new Date(),
            done:false
        };
        this.tickets.push(ticket);
        this.onTicketNumberChange();

        //todo: WS
        this.onTicketNumberChange();
        return ticket;
    }

    public drawTicket(desk:string){

        const ticket = this.tickets.find(t =>{
            return !t.handleAtDesk
        });

        if(!ticket) return {status: 'error', message: 'No hay tickets pendientes'}

        ticket.handleAtDesk = desk;
        ticket.handleAt = new Date();

        this.workingOnTickets.unshift({...ticket});
        this.onTicketNumberChange();
        this.onWorkingOnChange();

        return {status: 'ok', ticket };
    }

    public onFinishTicket(id: string){
        const ticket = this.tickets.find(t=> t.id === id);
        if(!ticket) return {status: 'error', message: 'Ticket no encontrado'}

        this.tickets = this.tickets.map(ticket=>{
            if(ticket.id===id){
                ticket.done=true;
            }

            return ticket;
        });

        return {status: 'ok'}
    }

    private onTicketNumberChange(){
        this.wssService.sendMessage('on-ticket-count-changed', {ticket: this.pendingTickets.length});
    }

    private onWorkingOnChange(){
        this.wssService.sendMessage('on-working-changed', {ticketWorking: this.workingOnTickets});
    }

}