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
import { NgxDropzoneModule } from 'ngx-dropzone';
import { UploadDocumentDialogComponent } from './components/upload-document-dialog/upload-document-dialog.component';
import { PrintableInvoiceComponent } from './printable/printable-invoice/printable-invoice.component';
import { PlantSelectComponent } from './components/plant-select/plant-select.component';
import { StorageCardComponent } from './components/storage-card/storage-card.component';


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
    PrintableInvoiceComponent,
    PlantSelectComponent,
    StorageCardComponent
  ],
  declarations: [
    ToolbarComponent,
    ContractPrintableComponent,
    ScaleToFitDirective,
    PrintableTicketComponent,
    FixTicketStorageComponent,
    UploadDocumentDialogComponent,
    PrintableInvoiceComponent,
    PlantSelectComponent,
    StorageCardComponent
  ]
})
export class SharedModule {}
