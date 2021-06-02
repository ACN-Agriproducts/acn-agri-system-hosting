import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TickestPageRoutingModule } from './tickest-routing.module';

import { TickestPage } from './tickest.page';
import { TableComponent } from './components/table/table.component';
import { FiltersComponent } from './components/filters/filters.component';
import { DetailsTicketComponent } from './components/details-ticket/details-ticket.component';
import { AddPictureComponent } from './components/add-picture/add-picture.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ModalTicketComponent } from './components/modal-ticket/modal-ticket.component';
import { ShowDetailsComponent } from './components/table/show-details/show-details.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TickestPageRoutingModule,
    CoreModule,
    NgxDropzoneModule
  ],
  declarations: [
    TickestPage,
    TableComponent,
    FiltersComponent,
    DetailsTicketComponent,
    AddPictureComponent,
    ModalTicketComponent,
    ShowDetailsComponent,
  ]
})
export class TickestPageModule { }
