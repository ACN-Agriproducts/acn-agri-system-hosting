import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ContractPrintableComponent } from './printable/contract-printable/contract-printable.component';
import { ScaleToFitDirective } from './scale-to-fit.directive';
import { PrintableTicketComponent } from './printable/printable-ticket/printable-ticket.component';
import { FixTicketStorageComponent } from './components/fix-ticket-storage/fix-ticket-storage.component';
import { CoreModule } from '@core/core.module';
import { UploadSignedContractComponent } from './components/upload-signed-contract/upload-signed-contract.component';
import { NgxDropzoneModule } from 'ngx-dropzone';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoreModule,
    NgxDropzoneModule,
  ],
  exports: [
    ToolbarComponent,
    ContractPrintableComponent,
    ScaleToFitDirective,
    PrintableTicketComponent,
  ],
  declarations: [
    ToolbarComponent,
    ContractPrintableComponent,
    ScaleToFitDirective,
    PrintableTicketComponent,
    FixTicketStorageComponent,
    UploadSignedContractComponent,
  ]
})
export class SharedModule {}
