import { Pipe, PipeTransform } from '@angular/core';
import { TicketWithDiscounts } from '@shared/classes/ticket';

@Pipe({
  name: 'selectedTickets',
})
export class SelectedTicketsPipe implements PipeTransform {

  transform(tickets: TicketWithDiscounts[], ...args: any): TicketWithDiscounts[] {
    return tickets?.filter(ticket => ticket.includeInReport) ?? [];
  }

}
