import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscountsPipe, LiquidationLongComponent, PriceDiscountsPipe, WeightDiscountsPipe } from './liquidation-long/liquidation-long.component';
import { PrintableLiquidationComponent } from './printable-liquidation.component';
import { CoreModule } from '@core/core.module';
import { SharedModule } from "../../shared/shared.module";
import { LiquidationLongUnitsComponent } from './liquidation-long-units/liquidation-long-units.component';



@NgModule({
    declarations: [
        PrintableLiquidationComponent,
        LiquidationLongComponent,
        DiscountsPipe,
        WeightDiscountsPipe,
        PriceDiscountsPipe,
        LiquidationLongUnitsComponent,
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
