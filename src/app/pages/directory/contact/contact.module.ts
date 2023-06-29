import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactPageRoutingModule } from './contact-routing.module';

import { ContactPage } from './contact.page';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { DirectoryPageModule } from '../directory.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContactPageRoutingModule,
    ReactiveFormsModule,
    CoreModule,
    SharedModule,
    DirectoryPageModule
  ],
  declarations: [ContactPage]
})
export class ContactPageModule {}
