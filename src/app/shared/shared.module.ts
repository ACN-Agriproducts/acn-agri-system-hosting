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
import { PrintableContractComponent } from './printable/printable-contract/printable-contract.component';
import { PurchaseToDepositComponent } from './printable/printable-contract/purchase-to-deposit/purchase-to-deposit.component';
import { ThirdPartyWarehouseComponent } from './printable/printable-contract/third-party-warehouse/third-party-warehouse.component';
import { PurchaseFixedPriceComponent } from './printable/printable-contract/purchase-fixed-price/purchase-fixed-price.component';
import { PurchaseUnfixedPriceComponent } from './printable/printable-contract/purchase-unfixed-price/purchase-unfixed-price.component';
import { SalesFixedPriceComponent } from './printable/printable-contract/sales-fixed-price/sales-fixed-price.component';
import { SalesUnfixedPriceComponent } from './printable/printable-contract/sales-unfixed-price/sales-unfixed-price.component';
import { SalesContractComponent } from './printable/printable-contract/sales-contract/sales-contract.component';
import { PurchaseContractComponent } from './printable/printable-contract/purchase-contract/purchase-contract.component';
import { TranslatePipe } from './pipes/translate/translate.pipe';
import { CurrencySplitPipe, ExchangeRateFieldPipe, NumberNameSpanishPipe, SelectFieldDisplayPipe } from './printable/printable-contract/printable-contract-utilities.service';
import { TruncatePipe } from './pipes/truncate/truncate.pipe';
import { RoundPipe } from './pipes/round/round.pipe';
// import { TypeTemplateDirective } from './directives/type-template/type-template.directive';
import { PrintableProductionOrderComponent } from './printable/printable-production-order/printable-production-order.component';
import { ProductionOrderDefaultComponent } from './printable/printable-production-order/production-order-default/production-order-default.component';
import { LocalInventoryPipe } from './pipes/localInventory/local-inventory.pipe';

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
    PrintableContractComponent,
    PurchaseToDepositComponent,
    NgxPrintModule,
    // TypeTemplateDirective,
    PrintableProductionOrderComponent,
    ProductionOrderDefaultComponent,
    LocalInventoryPipe,
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
    PrintableContractComponent,
    PurchaseToDepositComponent,
    ThirdPartyWarehouseComponent,
    PurchaseFixedPriceComponent,
    PurchaseUnfixedPriceComponent,
    SalesFixedPriceComponent,
    SalesUnfixedPriceComponent,
    SalesContractComponent,
    PurchaseContractComponent,
    TranslatePipe,
    SelectFieldDisplayPipe,
    NumberNameSpanishPipe,
    TruncatePipe,
    RoundPipe,
    // TypeTemplateDirective,
    PrintableProductionOrderComponent,
    ProductionOrderDefaultComponent,
    LocalInventoryPipe,
    ExchangeRateFieldPipe,
    CurrencySplitPipe
  ]
})
export class SharedModule {}
