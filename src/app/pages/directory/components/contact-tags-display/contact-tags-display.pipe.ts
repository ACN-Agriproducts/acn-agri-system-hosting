import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Contact } from '@shared/classes/contact';

@Pipe({
  name: 'contactTagsDisplay',
  standalone: true,
})
export class ContactTagsDisplayPipe implements PipeTransform {
  constructor(private transloco: TranslocoService) {}

  transform(contact: Contact, ...args: unknown[]): string {
    return contact.getType().map(t => this.transloco.translate(`directory.${t}`)).join(' / ');
  }

}
