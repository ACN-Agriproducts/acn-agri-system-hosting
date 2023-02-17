import { Pipe, PipeTransform } from '@angular/core';
import { TicketWithDiscount } from '@pages/contracts/contract-info/contract-info.page';

@Pipe({
  name: 'selectedTickets'
})
export class SelectedTicketsPipe implements PipeTransform {

  transform(tickets: TicketWithDiscount[]): TicketWithDiscount[] {
    return tickets?.filter(ticket => ticket.includeInReport) ?? [];
  }

}
