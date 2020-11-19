import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmployeesPageRoutingModule } from './employees-routing.module';

import { EmployeesPage } from './employees.page';
import { FormComponent } from './components/form/form.component';
import { ListComponent } from './components/list/list.component';
import { OptionsComponent } from './components/options/options.component';
import { ShowModalComponent } from './components/show-modal/show-modal.component';
import { ShowPictureComponent } from './components/show-picture/show-picture.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmployeesPageRoutingModule,
    CoreModule,
    
  ],
  declarations: [
    EmployeesPage,
    FormComponent,
    ListComponent,
    OptionsComponent,
    ShowModalComponent,
    ShowPictureComponent,
  ]
})
export class EmployeesPageModule { }
