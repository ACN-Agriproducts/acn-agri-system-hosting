import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TicketConsolePageRoutingModule } from './ticket-console-routing.module';

import { NewTicketDialog, TicketConsolePage } from './ticket-console.page';
import { CoreModule } from '@core/core.module';
import { TicketFormComponent } from './components/ticket-form/ticket-form.component';
import { ContractModule } from 'src/app/modules/contract/contract.module';
import { NgxPrintModule } from 'ngx-print';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TicketConsolePageRoutingModule,
    CoreModule,
    ContractModule,
    NgxPrintModule,
    SharedModule
  ],
  declarations: [
    TicketConsolePage, 
    TicketFormComponent, 
    NewTicketDialog, 
  ]
})
export class TicketConsolePageModule {}
