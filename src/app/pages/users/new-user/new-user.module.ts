import { CoreModule } from './../../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';

import { NewUserPageRoutingModule } from './new-user-routing.module';

import { NewUserPage } from './new-user.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewUserPageRoutingModule,
    CoreModule,
    ReactiveFormsModule,
    AngularFireFunctionsModule
  ],
  declarations: [NewUserPage]
})
export class NewUserPageModule {}
