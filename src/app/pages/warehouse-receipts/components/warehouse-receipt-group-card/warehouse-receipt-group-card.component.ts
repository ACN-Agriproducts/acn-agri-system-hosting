import { Component, Input, OnInit } from '@angular/core';
import { serverTimestamp } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { AlertController } from '@ionic/angular';
import { WarehouseReceipt, WarehouseReceiptContract, WarehouseReceiptGroup } from '@shared/classes/WarehouseReceiptGroup';
import { lastValueFrom } from 'rxjs';
import { SetContractModalComponent } from '../set-contract-modal/set-contract-modal.component';

@Component({
  selector: 'app-warehouse-receipt-group-card',
  templateUrl: './warehouse-receipt-group-card.component.html',
  styleUrls: ['../../warehouse-receipts.page.scss'],
})
export class WarehouseReceiptGroupCardComponent implements OnInit {
  @Input() wrGroup: WarehouseReceiptGroup;

  public idRange: string;
  public wrIdList: number[];
  public wrList: WarehouseReceipt[];

  public purchaseContract: WarehouseReceiptContract;
  public saleContract: WarehouseReceiptContract;

  public expanded: boolean = false;

  constructor(
    private dialog: MatDialog,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.wrList = this.wrGroup.warehouseReceiptList.sort((a, b) => a.id - b.id);
    this.wrIdList = this.wrGroup.warehouseReceiptIdList.sort((a, b) => a - b);

    this.idRange = this.getIdRange();

    this.purchaseContract = this.wrGroup.purchaseContract ?? null;
    this.saleContract = this.wrGroup.saleContract ?? null;
  }

  public getIdRange(): string {
    let sequence: any[][] = [];
    let subseq = [];

    this.wrIdList.forEach((id, index) => {
      if (index === 0 || id === this.wrIdList[index - 1] + 1) {
        subseq.push(id);
      }
      else {
        sequence.push(subseq);
        subseq = [];
        subseq.push(id);
      }
    });
    sequence.push(subseq);

    let result = ``;
    sequence.forEach((sub, index) => {
      result += `${sub[0]}-${sub[sub.length - 1]}` + (index !== sequence.length - 1 ? `, `: ``);
    });

    return result;
  }

  public isEditable(contract: WarehouseReceiptContract): boolean {
    if (contract?.closedAt === undefined) {
      return true;
    }

    const HOUR_TO_MS = 1000 * 60 * 60;

    const now = new Date().getTime();
    const then = contract?.closedAt?.getTime();

    const hoursSinceCreated = (now - then) / HOUR_TO_MS;

    return hoursSinceCreated < 24 ? true : false;
  }

  public async setContract(contract: WarehouseReceiptContract, isPurchase: boolean): Promise<void> {
    const contractData: ContractData = { 
      startDate: new Date(), 
      status: isPurchase ? "CLOSED" : "PENDING"
    };

    if (contract) {
      contractData.basePrice = contract.basePrice;
      contractData.futurePrice = contract.futurePrice;
      contractData.id = contract.id;
      contractData.startDate = contract.startDate;
      contractData.pdfReference = contract.pdfReference ?? null;
    }

    let updateData = await this.setContractDialog(contractData);
    if (updateData === undefined) return;

    const contractType = isPurchase ? 'purchaseContract' : 'saleContract';
    const fallback = this.wrGroup[contractType];
  
    updateData = isPurchase ? { ...updateData, closedAt: serverTimestamp() } : updateData;
    this.wrGroup[contractType] = updateData;

    this.wrGroup.update({
      [contractType]: updateData,
      status: "ACTIVE"
    })
    .catch(error => {
      this.wrGroup[contractType] = fallback;
      console.log(`Error: `, error);
    });
  }

  public setContractDialog(contractUpdateDoc: ContractData): any {
    const dailogRef = this.dialog.open(SetContractModalComponent, {
      data: contractUpdateDoc,
      height: '300px',
      width: '550px'
    });

    return lastValueFrom(dailogRef.afterClosed()).then(result => {
      return result;
    });
  }

  public hasPaid(): number {
    return this.wrList.filter(wr => wr.isPaid).length;
  }

  public toggleExpandable(event: Event): void {
    this.expanded = !this.expanded;
    // const icon = event.target as HTMLElement;
    // const card = icon.parentElement.parentElement;
    // // const expandable = card.querySelector('.expandable-wr-list') as HTMLElement;

    // // // if (expandable.style.maxHeight) {
    // // //   icon.innerHTML = "keyboard_arrow_down";
    // // //   expandable.style.maxHeight = null;
    // // // }
    // // // else {
    // // //   icon.innerHTML = "keyboard_arrow_up";
    // // //   expandable.style.maxHeight = expandable.scrollHeight + "px";
    // // // }
  }

  public async paidWarehouseReceipt(warehouseReceipt: WarehouseReceipt, index: number): Promise<void> {
    if (this.wrGroup.saleContract === null) {
      console.log("Error: Sale Contract must be present.");
      return;
    }

    const alert = await this.alertCtrl.create({
      header: "Confirmation",
      message: `Are you sure you would like to set the status of Warehouse Receipt ${warehouseReceipt.id} as paid?`,
      buttons: [
        {
          text: 'yes',
          handler: () => {
            alert.dismiss();
            this.updatePaidStatus(index);
          }
        },
        {
          text: 'no',
          role: 'cancel'
        }
      ]
    });
    alert.present();
  }

  public updatePaidStatus(index: number) {
    const fallback = this.wrList;
    this.wrList[index].isPaid = true;

    const updateList = this.wrGroup.getRawReceiptList();
    updateList[index].isPaid = true;

    this.wrGroup.update({
      warehouseReceiptList: updateList
    })
    .then(() => {
      console.log(this.wrGroup.warehouseReceiptList[index].isPaid);
    })
    .catch(error => {
      this.wrGroup.warehouseReceiptList = fallback; // ??
      console.log("Error: ", error);
    });
    
    console.log("Warehouse Receipt has been paid.");
  }
}

interface ContractData {
  basePrice?: number;
  futurePrice?: number;
  id?: string;
  pdfReference?: string;
  startDate: Date;
  status?: string;
}

interface WarehouseReceiptData {
  bushelQuantity: number;
  id: number;
  isPaid: boolean;
  plant: string;
  product: string;
  startDate: Date;
}
