import { Pipe, PipeTransform } from '@angular/core';
import { ReportTicket } from '@shared/classes/ticket';

@Pipe({
  name: 'selectedTickets',
})
export class SelectedTicketsPipe implements PipeTransform {

  transform(tickets: ReportTicket[], ...args: any): ReportTicket[] {
    return tickets?.filter(ticket => ticket.inReport) ?? [];
  }

}
