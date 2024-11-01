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
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { SplitTicketComponent } from 'src/app/standalone/split-ticket/split-ticket.component';
import { DiscountsDialogComponent } from './components/discounts-dialog/discounts-dialog.component';
import { AppPhotosComponent } from './components/app-photos/app-photos.component';
import { MatDialog } from '@angular/material/dialog';

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
    MatDialogModule,
    SplitTicketComponent
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
    TicketReportDialogComponent,
    DiscountsDialogComponent,
    AppPhotosComponent
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
  ]
})
export class TickestPageModule { }
