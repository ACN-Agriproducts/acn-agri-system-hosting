import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CompanyService } from '@core/services/company/company.service';
import { LoadOrder } from '@shared/classes/load-orders.model';
import { LoadOrderService } from '@shared/model-services/load-order.service';
import { SetOrderModalComponent } from './components/set-order-modal/set-order-modal.component';

@Component({
  selector: 'app-load-orders',
  templateUrl: './load-orders.page.html',
  styleUrls: ['./load-orders.page.scss'],
})
export class LoadOrdersPage implements OnInit {
  tableData;

  constructor(
    private company: CompanyService,
    private LoadOrders: LoadOrderService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.tableData = new Array(25);
  }

  newOrderDialog() {
    const newLoadOrder = new LoadOrder(null);
    newLoadOrder.plants = this.company.getPlantsList().map(plant => plant.ref.id);

    const dialogRef = this.dialog.open(SetOrderModalComponent, {
      data: newLoadOrder
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result) return;
      this.LoadOrders.add(newLoadOrder);
    });
  }
}
