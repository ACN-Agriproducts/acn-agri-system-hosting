import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TicketConsolePageRoutingModule } from './ticket-console-routing.module';

import { TicketConsolePage } from './ticket-console.page';
import { CoreModule } from '@core/core.module';
import { TicketFormComponent } from './components/ticket-form/ticket-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TicketConsolePageRoutingModule,
    CoreModule,
  ],
  declarations: [TicketConsolePage, TicketFormComponent]
})
export class TicketConsolePageModule {}
