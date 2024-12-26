import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReportOptionsComponent } from '@core/components/report-options/report-options.component';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  // public optionsGroups: {
  //   label: string;
  //   options: {
  //     label: string;
  //     value: string;
  //   }[];
  // };

  public exportFormat: string;
  public reportData: any[];

  constructor(
    public dialog: MatDialog
  ) {}

  // starts the report process
  public async run() {
    // open the report options dialog
    const optionsDialogRef = this.openOptionsDialog();

    // close the dialog or receive the options selected and continue report process
    const result = await lastValueFrom(optionsDialogRef.afterClosed());
    if (result == null) return;

    this.exportFormat = result.exportFormat;

    // open report component or create & download excel report
    if (this.exportFormat === "print") {
      this.openPreviewDialog();
    }
    else if (this.exportFormat === "excel") {
      this.downloadExcel();
    }
  }

  public openOptionsDialog() {
    const dialogRef = this.dialog.open(ReportOptionsComponent, {
      width: '900px',
      height: '600px',
      autoFocus: false,
      data: {
        exportFormat: this.exportFormat
      }
    });

    return dialogRef;
  }

  public openPreviewDialog() {
    // open report dialog
  }

  public downloadExcel() {
    // create excel report and download it
  }

}
