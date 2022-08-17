import { Component, Input, OnInit } from '@angular/core';
import { serverTimestamp } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
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

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    this.wrIdList = this.wrGroup.warehouseReceiptIdList.sort((a, b) => a - b);
    this.wrList = this.wrGroup.warehouseReceiptList.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    this.idRange = this.getIdRange();

    this.purchaseContract = this.wrGroup.purchaseContract ?? null;
    this.saleContract = this.wrGroup.saleContract ?? null;


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
    const contractData: ContractData = { startDate: new Date(), status: isPurchase ? "CLOSED" : "PENDING" };

    if (contract) {
      contractData.basePrice = contract.basePrice;
      contractData.futurePrice = contract.futurePrice;
      contractData.id = contract.id;
      contractData.startDate = contract.startDate;
      contractData.pdfReference = contract.pdfReference ?? null;
    }

    let updateData = await this.modifyContractDialog(contractData);
    if (updateData === undefined) return;
    
    updateData = isPurchase ? { ...updateData, closedAt: serverTimestamp() } : updateData;

    this.wrGroup.update({
      [isPurchase ? 'purchaseContract' : 'saleContract']: updateData,
      status: "ACTIVE"
    })
    .catch(error => {
      console.log(`Error: `, error);
    });
  }

  public modifyContractDialog(contractData: ContractData): any {
    const dailogRef = this.dialog.open(SetContractModalComponent, {
      data: contractData,
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
    const icon = event.target as HTMLElement;
    const card = icon.parentElement.parentElement;
    const expandable = card.querySelector('.expandable-wr-list') as HTMLElement;

    if (expandable.style.maxHeight) {
      icon.innerHTML = "keyboard_arrow_down";
      expandable.style.maxHeight = null;
    }
    else {
      icon.innerHTML = "keyboard_arrow_up";
      expandable.style.maxHeight = expandable.scrollHeight + "px";
    }
  }

  public paidWarehouseReceipt(warehouseReceipt: WarehouseReceipt, index: number): void {
    if (this.wrGroup.saleContract === null) {
      console.log("Error: Sale Contract must be present.");
      return;
    }

    this.wrList[index].isPaid = true;

    /* this.wrGroup.update({
      warehouseReceiptList: this.wrList
    }) */

    console.log("Warehouse Receipt has been paid");
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
