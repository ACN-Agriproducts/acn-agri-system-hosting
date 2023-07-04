import { Pipe, PipeTransform } from '@angular/core';
import { TicketWithDiscount } from '@shared/classes/ticket';

@Pipe({
  name: 'selectedTickets'
})
export class SelectedTicketsPipe implements PipeTransform {

  transform(tickets: TicketWithDiscount[]): TicketWithDiscount[] {
    return tickets?.filter(ticket => ticket.includeInReport) ?? [];
  }

}
