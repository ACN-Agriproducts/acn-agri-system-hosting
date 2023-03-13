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
import { FilterContractsPipe } from './pipes/filter-contracts.pipe';
import { SectionTitleComponent } from './components/section-title/section-title.component';
import { HashMapPipe } from './pipes/hashmap/hashmap.pipe';
import { SelectedTicketsPipe } from './pipes/selectedTickets/selected-tickets.pipe';
import { InvoiceOneComponent } from './printable/printable-invoice/invoice-one/invoice-one.component';
import { InvoiceTwoComponent } from './printable/printable-invoice/invoice-two/invoice-two.component';
import { InvoiceDialogComponent } from './printable/printable-invoice/invoice-dialog/invoice-dialog.component';
import { NgxPrintModule } from 'ngx-print';
import { DocumentWrapperComponent } from './components/document-wrapper/document-wrapper.component';
import { TypeTemplateDirective } from './directives/type-template/type-template.directive';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoreModule,
    NgxDropzoneModule,
    NgxPrintModule
  ],
  exports: [
    ToolbarComponent,
    ContractPrintableComponent,
    ScaleToFitDirective,
    PrintableTicketComponent,
    PrintableInvoiceComponent,
    FilterContractsPipe,
    SectionTitleComponent,
    HashMapPipe,
    SelectedTicketsPipe,
    InvoiceOneComponent,
    InvoiceTwoComponent,
    InvoiceDialogComponent,
    DocumentWrapperComponent,
    TypeTemplateDirective
  ],
  declarations: [
    ToolbarComponent,
    ContractPrintableComponent,
    ScaleToFitDirective,
    PrintableTicketComponent,
    FixTicketStorageComponent,
    UploadDocumentDialogComponent,
    PrintableInvoiceComponent,
    FilterContractsPipe,
    SectionTitleComponent,
    HashMapPipe,
    SelectedTicketsPipe,
    InvoiceOneComponent,
    InvoiceTwoComponent,
    InvoiceDialogComponent,
    DocumentWrapperComponent,
    TypeTemplateDirective,
  ]
})
export class SharedModule {}
