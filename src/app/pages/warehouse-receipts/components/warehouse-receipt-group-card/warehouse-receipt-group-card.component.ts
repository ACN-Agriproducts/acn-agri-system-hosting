import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { WarehouseReceipt, WarehouseReceiptGroup, WarehouseReceiptContract } from '@shared/classes/WarehouseReceiptGroup';
import { SetContractModalComponent } from '../set-contract-modal/set-contract-modal.component';

@Component({
  selector: 'app-warehouse-receipt-group-card',
  templateUrl: './warehouse-receipt-group-card.component.html',
  styleUrls: ['../../warehouse-receipts.page.scss'],
})
export class WarehouseReceiptGroupCardComponent implements OnInit {
  @Input() wrGroup: WarehouseReceiptGroup;

  public wrList: WarehouseReceipt[];
  public wrIdList: number[];
  public idRange: string;
  public purchaseContract: WarehouseReceiptContract = null;
  public saleContract: WarehouseReceiptContract = null;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    this.wrList = this.wrGroup.warehouseReceiptList.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    this.wrIdList = this.wrGroup.warehouseReceiptIdList.sort((a, b) => a - b);

    this.idRange = this.getIdRange();
  }


  public getIdRange(): string {
    let result: string[] = [];
    let idGroup = "";
    this.wrIdList.forEach((id, index) => {
      if (index === this.wrIdList.length - 1) {
        return;
      }
      
      if (this.wrIdList[index + 1] - id > 1) {
        idGroup = "";
        result.push(`${id} `);
        return;
      }
      idGroup = ``
      result.push(`${id}`);
    });

    return result.join();
  }

  public async setContract(contract: any) {
    const modal = await this.modalController.create({
      component: SetContractModalComponent,
      componentProps: contract,
      backdropDismiss: false
    });
    modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role === 'confirm') {
      console.log(data);
    }
  }

  public addContract() {
    
  }

  public toggleExpandable(event: Event): void {
    const icon = event.target as HTMLElement;
    const card = icon.parentElement.parentElement;
    const expandable = card.querySelector('.expandable-wr-list') as HTMLElement;

    if (expandable.style.maxHeight){
      icon.setAttribute('name', "arrow-down-outline");
      expandable.style.maxHeight = null;
    } else {
      icon.setAttribute('name', "arrow-up-outline");
      expandable.style.maxHeight = expandable.scrollHeight + "px";
    }
  }

}
