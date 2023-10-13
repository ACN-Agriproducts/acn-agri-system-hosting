import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TicketConsolePageRoutingModule } from './ticket-console-routing.module';

import { NewTicketDialog, TicketConsolePage, TicketSelectorPipe } from './ticket-console.page';
import { CoreModule } from '@core/core.module';
import { TicketFormComponent } from './components/ticket-form/ticket-form.component';
import { TicketTemplateDirective } from './ticket-template-directive.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TicketConsolePageRoutingModule,
    CoreModule,
  ],
  declarations: [
    TicketConsolePage, 
    TicketFormComponent, 
    NewTicketDialog, 
    TicketTemplateDirective,
    TicketSelectorPipe
  ]
})
export class TicketConsolePageModule {}
