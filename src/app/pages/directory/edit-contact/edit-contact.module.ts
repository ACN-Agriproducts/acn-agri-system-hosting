import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditContactPageRoutingModule } from './edit-contact-routing.module';

import { EditContactPage } from './edit-contact.page';
import { CoreModule } from '@core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditContactPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule
  ],
  declarations: [EditContactPage]
})
export class EditContactPageModule {}
