import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractFormComponent } from './contract-form/contract-form.component';
import { SelectClientComponent } from './select-client/select-client.component';
import { CoreModule } from '@core/core.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GetFieldClassPipe } from './pipes/get-field-class.pipe';
import { FutureDateFormatDirective } from './directives/future-date-format.directive';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  declarations: [
    ContractFormComponent,
    SelectClientComponent,
    GetFieldClassPipe,
    FutureDateFormatDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormsModule,
    CoreModule,
    TranslocoModule
  ],
  exports: [
    ContractFormComponent
  ]
})
export class ContractModule { }
