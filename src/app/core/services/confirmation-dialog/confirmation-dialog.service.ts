import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@core/components/confirmation-dialog/confirmation-dialog.component';
import { TranslocoService } from '@ngneat/transloco';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  constructor(private dialog: MatDialog, private transloco: TranslocoService) { }

  /**
   * 
   * @param action Dialog will read as: "Are you sure you would like to {{ action }}?". All text will be translated except for the action.
   * @returns true or false based on whether user chooses yes or no.
   */
  public openDialog(action: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: action,
      autoFocus: false
    });
    return lastValueFrom(dialogRef.afterClosed());
  }

  /**
   * 
   * @param action Dialog will read as: "Are you sure you would like to {{ action }}?". All text will be translated including the action.
   * @returns true or false based on whether user chooses yes or no.
   */
  public openWithTranslatedAction(action: string): Promise<boolean> {
    return this.openDialog(this.transloco.translate(action,{},'messages'));
  }

}
