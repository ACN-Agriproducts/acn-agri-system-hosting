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
import { CurrencySplitPipe, ExchangeRateFieldPipe, NumberNameSpanishPipe, SelectFieldDisplayPipe } from './printable-contract-utilities.service';
import { CoreModule } from '@core/core.module';



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
    FocusedFieldDirective
  ],
  exports: [
    PrintableContractComponent
  ],
  imports: [
    CommonModule,
    CoreModule
  ]
})
export class ContractPrintablesModule { }
