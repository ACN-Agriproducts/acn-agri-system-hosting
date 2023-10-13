import { Directive, Input, TemplateRef } from '@angular/core';
import { Ticket } from '@shared/classes/ticket';

@Directive({
  selector: '[ticketTemplate]'
})
export class TicketTemplateDirective {
  @Input() ticketTemplate: Ticket;

  constructor(public templateRef: TemplateRef<any>) { }

}
