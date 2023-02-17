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
import { OptionsTicketComponent } from './components/options-ticket/options-ticket.component';
import { TicketReportDialogComponent } from './components/ticket-report-dialog/ticket-report-dialog.component';
import { SharedModule } from '@shared/shared.module';
import { NgxPrintModule } from 'ngx-print';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TickestPageRoutingModule,
    CoreModule,
    NgxDropzoneModule,
    SharedModule,
    NgxPrintModule,
    MatDialogModule
  ],
  declarations: [
    TickestPage,
    TableComponent,
    FiltersComponent,
    DetailsTicketComponent,
    AddPictureComponent,
    ModalTicketComponent,
    ShowDetailsComponent,
    OptionsTicketComponent,
    TicketReportDialogComponent
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ]
})
export class TickestPageModule { }
