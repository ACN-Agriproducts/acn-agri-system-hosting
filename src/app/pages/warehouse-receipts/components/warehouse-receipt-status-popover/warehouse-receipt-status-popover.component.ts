import { Component, Input, OnInit, Output } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-warehouse-receipt-status-popover',
  templateUrl: './warehouse-receipt-status-popover.component.html',
  styleUrls: ['./warehouse-receipt-status-popover.component.scss'],
})
export class WarehouseReceiptStatusPopoverComponent implements OnInit {
  @Input() status: string;

  constructor(private popoverController: PopoverController) { }

  ngOnInit() {}

  submit() {
    return this.popoverController.dismiss(this.status);
  }

}
