import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscountsPipe, LiquidationLongComponent, NonZeroDiscountsPipe, WeightDiscountsPipe } from './liquidation-long/liquidation-long.component';
import { PrintableLiquidationComponent } from './printable-liquidation.component';
import { CoreModule } from '@core/core.module';
import { SharedModule } from "../../shared/shared.module";
import { LiquidationDialogComponent } from './liquidation-dialog/liquidation-dialog.component';
import { SalesLiquidationComponent } from './sales-liquidation/sales-liquidation.component';


@NgModule({
    declarations: [
        PrintableLiquidationComponent,
        LiquidationLongComponent,
        DiscountsPipe,
        WeightDiscountsPipe,
        // PriceDiscountsPipe,
        LiquidationDialogComponent,
        SalesLiquidationComponent,
        NonZeroDiscountsPipe
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
