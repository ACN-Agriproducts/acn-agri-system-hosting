import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DiscountTable } from '@shared/classes/discount-tables';
import { SetDiscountTableDialogComponent } from '../set-discount-table-dialog/set-discount-table-dialog.component';
import { lastValueFrom } from 'rxjs';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';

@Component({
  selector: 'app-discount-table',
  templateUrl: './discount-table.component.html',
  styleUrls: ['./discount-table.component.scss'],
})
export class DiscountTableComponent implements OnInit {
  @Input() table: DiscountTable;
  
  public editing: boolean = false;
  public saving: boolean = false;

  constructor(
    private dialog: MatDialog,
    private confirmation: ConfirmationDialogService,
    private snack: SnackbarService,
  ) { }

  ngOnInit() { }

  // FIX BUG WITH CDK DRAG LIST

  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.table.data, event.previousIndex, event.currentIndex);
  }
}
