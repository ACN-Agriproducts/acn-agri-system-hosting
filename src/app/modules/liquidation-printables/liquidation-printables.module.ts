import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscountsPipe, LiquidationLongComponent, FilterWeightDiscounts, WeightDiscountsPipe, FilterPriceDiscounts } from './liquidation-long/liquidation-long.component';
import { PrintableLiquidationComponent } from './printable-liquidation.component';
import { CoreModule } from '@core/core.module';
import { SharedModule } from "../../shared/shared.module";
import { LiquidationDialogComponent } from './liquidation-dialog/liquidation-dialog.component';
import { SalesLiquidationComponent } from './sales-liquidation/sales-liquidation.component';
import { ContractPrintablesModule } from '../contract-printables/contract-printables.module';


@NgModule({
    declarations: [
        PrintableLiquidationComponent,
        LiquidationLongComponent,
        DiscountsPipe,
        WeightDiscountsPipe,
        // PriceDiscountsPipe,
        LiquidationDialogComponent,
        SalesLiquidationComponent,
        FilterWeightDiscounts,
        FilterPriceDiscounts
    ],
    exports: [
        PrintableLiquidationComponent,
        LiquidationLongComponent,
    ],
    imports: [
        CommonModule,
        CoreModule,
        SharedModule
    ]
})
export class LiquidationPrintablesModule { }
