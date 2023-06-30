import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactPageRoutingModule } from './contact-routing.module';

import { ContactPage } from './contact.page';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { DirectoryPageModule } from '../directory.module';
import { ContactTagsDisplayPipe } from '../components/contact-tags-display/contact-tags-display.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContactPageRoutingModule,
    ReactiveFormsModule,
    CoreModule,
    SharedModule,
    ContactTagsDisplayPipe
  ],
  declarations: [ContactPage]
})
export class ContactPageModule {}
