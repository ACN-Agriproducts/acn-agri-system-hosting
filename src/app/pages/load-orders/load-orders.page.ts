import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CompanyService } from '@core/services/company/company.service';
import { LoadOrder } from '@shared/classes/load-orders.model';
import { LoadOrderService } from '@shared/model-services/load-order.service';
import { SetOrderModalComponent } from './components/set-order-modal/set-order-modal.component';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';

@Component({
  selector: 'app-load-orders',
  templateUrl: './load-orders.page.html',
  styleUrls: ['./load-orders.page.scss'],
})
export class LoadOrdersPage implements OnInit {
  tableData: Promise<LoadOrder[]>[];
  index: number;

  constructor(
    private company: CompanyService,
    private LoadOrders: LoadOrderService,
    private dialog: MatDialog,
    private snack: SnackbarService
  ) { }

  ngOnInit() {
    this.tableData = [this.LoadOrders.getList(20)];
    this.index = 0;
  }

  newOrderDialog() {
    const newLoadOrder = new LoadOrder(null);
    newLoadOrder.plants = this.company.getPlantsNamesList();

    const dialogRef = this.dialog.open(SetOrderModalComponent, {
      data: newLoadOrder
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result) return;

      this.LoadOrders.add(newLoadOrder).then(async () => {
        (await this.tableData[0]).unshift(newLoadOrder);
        this.snack.open("Successfully added", 'success');
      }).catch(error => {
        console.error(error);
        this.snack.open("There has been an error", "error");
      });
    });
  }

  editOrderDialog(order: LoadOrder) {
    const dialogRef = this.dialog.open(SetOrderModalComponent, {
      data: order
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result) return;

      order.set().then(() => {
        this.snack.open("Successfully updated Load Order", 'success');
      }).catch(error => {
        console.error(error);
        this.snack.open("There has been an error", 'error')
      });
    })
  }

  cancelOrder(order: LoadOrder) {
    order.updateStatus('cancelled').then(() => {
      this.snack.open('Successfully updated status', 'success');
    }).catch(error => {
      console.error(error);
      this.snack.open('There has been an error', 'error');
    });
  }
}
