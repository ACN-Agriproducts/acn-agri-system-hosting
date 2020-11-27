import { CoreModule } from '@core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsersPageRoutingModule } from './users-routing.module';

import { UsersPage } from './users.page';
import { ListComponent } from './components/list/list.component';
import { NewUserComponent } from './components/new-user/new-user.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsersPageRoutingModule,
    CoreModule
  ],
  declarations: [UsersPage, ListComponent, NewUserComponent]
})
export class UsersPageModule {}
