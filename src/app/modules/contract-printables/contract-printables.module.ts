import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintableContractComponent, FocusedFieldDirective } from './printable-contract.component';
import { ThirdPartyWarehouseComponent } from './third-party-warehouse/third-party-warehouse.component';
import { SalesUnfixedPriceComponent } from './sales-unfixed-price/sales-unfixed-price.component';
import { SalesFixedPriceComponent } from './sales-fixed-price/sales-fixed-price.component';
import { SalesContractComponent } from './sales-contract/sales-contract.component';
import { PurchaseUnfixedPriceComponent } from './purchase-unfixed-price/purchase-unfixed-price.component';
import { PurchaseToDepositComponent } from './purchase-to-deposit/purchase-to-deposit.component';
import { PurchaseFixedPriceComponent } from './purchase-fixed-price/purchase-fixed-price.component';
import { PurchaseContractComponent } from './purchase-contract/purchase-contract.component';
import { ContractIdPipe, CurrencySplitPipe, ExchangeRateFieldPipe, FlatPricePipe, MaskValuePipe, MaskZerosPipe, NumberNameSpanishPipe, SelectFieldDisplayPipe } from './printable-contract-utilities.service';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { ContractDialogComponent } from './contract-dialog/contract-dialog.component';



@NgModule({
  declarations: [
    PrintableContractComponent,
    ThirdPartyWarehouseComponent,
    SalesUnfixedPriceComponent,
    SalesFixedPriceComponent,
    SalesContractComponent,
    PurchaseUnfixedPriceComponent,
    PurchaseToDepositComponent,
    PurchaseFixedPriceComponent,
    PurchaseContractComponent,
    SelectFieldDisplayPipe,
    NumberNameSpanishPipe,
    ExchangeRateFieldPipe,
    CurrencySplitPipe,
    FocusedFieldDirective,
    ContractIdPipe,
    ContractDialogComponent,
    FlatPricePipe,
    MaskZerosPipe,
    MaskValuePipe
  ],
  exports: [
    PrintableContractComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    SharedModule
  ]
})
export class ContractPrintablesModule { }
