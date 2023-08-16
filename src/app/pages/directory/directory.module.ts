import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DirectoryPageRoutingModule } from './directory-routing.module';

import { DirectoryPage } from './directory.page';
import { OptionsDirectoryComponent } from './components/options-directory/options-directory.component';
import { ShowContactModalComponent } from './components/show-contact-modal/show-contact-modal.component';
import { AddNewTagDialogComponent, EditContactDialogComponent, PrimaryPipe } from './components/edit-contact-dialog/edit-contact-dialog.component';
import { ContactTagsDisplayPipe } from './components/contact-tags-display/contact-tags-display.pipe';
import { TruckerFieldsDialog } from './components/trucker-fields-dialog/trucker-fields.dialog';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DirectoryPageRoutingModule,
    CoreModule,
    ReactiveFormsModule,
    ContactTagsDisplayPipe
  ],
  declarations: [
    DirectoryPage, 
    OptionsDirectoryComponent, 
    ShowContactModalComponent,
    EditContactDialogComponent,
    AddNewTagDialogComponent,
    PrimaryPipe,
    TruckerFieldsDialog
  ]
})
export class DirectoryPageModule {}
