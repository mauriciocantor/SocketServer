


export interface TicketInterface {
    id:string;
    number:number;
    createdAt:Date;
    handleAtDesk?:string;
    handleAt?:Date;
    done:boolean;
}