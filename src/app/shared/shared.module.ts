import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ScaleToFitDirective } from './scale-to-fit.directive';
import { PrintableTicketComponent } from './printable/printable-ticket/printable-ticket.component';
import { FixTicketStorageComponent } from './components/fix-ticket-storage/fix-ticket-storage.component';
import { CoreModule } from '@core/core.module';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { UploadDocumentDialogComponent } from './components/upload-document-dialog/upload-document-dialog.component';
import { PrintableInvoiceComponent } from './printable/printable-invoice/printable-invoice.component';
import { PlantSelectComponent } from './components/plant-select/plant-select.component';
import { StorageCardComponent } from './components/storage-card/storage-card.component';
import { FilterContractsPipe } from './pipes/filter-contracts.pipe';
import { SectionTitleComponent } from './components/section-title/section-title.component';
import { HashMapPipe } from './pipes/hashmap/hashmap.pipe';
import { SelectedTicketsPipe } from './pipes/selectedTickets/selected-tickets.pipe';
import { InvoiceOneComponent } from './printable/printable-invoice/invoice-one/invoice-one.component';
import { InvoiceTwoComponent } from './printable/printable-invoice/invoice-two/invoice-two.component';
import { InvoiceDialogComponent } from './printable/printable-invoice/invoice-dialog/invoice-dialog.component';
import { NgxPrintModule } from 'ngx-print';
import { DocumentWrapperComponent } from './components/document-wrapper/document-wrapper.component';
import { TruncatePipe } from './pipes/truncate/truncate.pipe';
import { PrintableProductionOrderComponent } from './printable/printable-production-order/printable-production-order.component';
import { ProductionOrderDefaultComponent } from './printable/printable-production-order/production-order-default/production-order-default.component';
import { LocalInventoryPipe } from './pipes/localInventory/local-inventory.pipe';
import { pricerPerUnitPipe } from './classes/price';
import { PrintableDialogComponent } from './components/printable-dialog/printable-dialog.component';
import { DocumentUploadDialogComponent } from './components/document-upload-dialog/document-upload-dialog.component';
import { TemplateRefModule } from './template-ref';
import { TableHeaderUnitSelectComponent } from './components/table-header-unit-select/table-header-unit-select.component';
import { NewNoteComponent } from './components/new-note/new-note/new-note.component';
import { ReportOptionsComponent } from './components/report-options/report-options.component';

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
    ScaleToFitDirective,
    PrintableTicketComponent,
    PrintableInvoiceComponent,
    PlantSelectComponent,
    StorageCardComponent,
    FilterContractsPipe,
    SectionTitleComponent,
    HashMapPipe,
    SelectedTicketsPipe,
    InvoiceOneComponent,
    InvoiceTwoComponent,
    InvoiceDialogComponent,
    DocumentWrapperComponent,
    NgxPrintModule,
    PrintableProductionOrderComponent,
    ProductionOrderDefaultComponent,
    LocalInventoryPipe,
    pricerPerUnitPipe,
    PrintableDialogComponent,
    TemplateRefModule,
    TableHeaderUnitSelectComponent
  ],
  declarations: [
    ToolbarComponent,
    ScaleToFitDirective,
    PrintableTicketComponent,
    FixTicketStorageComponent,
    UploadDocumentDialogComponent,
    PrintableInvoiceComponent,
    PlantSelectComponent,
    StorageCardComponent,
    FilterContractsPipe,
    SectionTitleComponent,
    HashMapPipe,
    SelectedTicketsPipe,
    InvoiceOneComponent,
    InvoiceTwoComponent,
    InvoiceDialogComponent,
    DocumentWrapperComponent,
    TruncatePipe,
    PrintableProductionOrderComponent,
    ProductionOrderDefaultComponent,
    LocalInventoryPipe,
    pricerPerUnitPipe,
    PrintableDialogComponent,
    DocumentUploadDialogComponent,
    TableHeaderUnitSelectComponent,
    NewNoteComponent,
    ReportOptionsComponent
  ]
})
export class SharedModule {}
