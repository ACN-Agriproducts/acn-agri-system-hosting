import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DirectoryPageRoutingModule } from './directory-routing.module';

import { DirectoryPage } from './directory.page';
import { OptionsDirectoryComponent } from './components/options-directory/options-directory.component';
import { ShowContactModalComponent } from './components/show-contact-modal/show-contact-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DirectoryPageRoutingModule,
    CoreModule
  ],
  declarations: [DirectoryPage, OptionsDirectoryComponent, ShowContactModalComponent]
})
export class DirectoryPageModule {}
