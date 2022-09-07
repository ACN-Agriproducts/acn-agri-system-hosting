import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '@core/components/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackbar: MatSnackBar) { }

  public openSnackbar(message: string, action: string, snackType?: string) {
    const _snackType = typeof snackType !== undefined ? snackType : 'Success';

    this.snackbar.openFromComponent(SnackbarComponent, {
      duration: 2000,
      data: {
        message,
        snackType
      }
    });
  }
}
