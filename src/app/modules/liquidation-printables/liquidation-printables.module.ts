import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscountsPipe, LiquidationLongComponent } from './liquidation-long/liquidation-long.component';
import { PrintableLiquidationComponent } from './printable-liquidation/printable-liquidation.component';
import { CoreModule } from '@core/core.module';
import { SharedModule } from "../../shared/shared.module";



@NgModule({
    declarations: [
        PrintableLiquidationComponent,
        LiquidationLongComponent,
        DiscountsPipe,
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
