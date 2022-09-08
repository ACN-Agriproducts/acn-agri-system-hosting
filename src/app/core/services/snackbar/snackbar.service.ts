import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '@core/components/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackbar: MatSnackBar) { }

  public openSnackbar(message: string, snackType: string = 'info', action?: string) {
    const className = `snackbar-${snackType}`;

    this.snackbar.openFromComponent(SnackbarComponent, {
      duration: snackType === 'error' ? 5000 : 2000,
      panelClass: className,
      data: {
        message,
        snackType,
        action
      }
    });
  }
}
