import { Component, Input, OnInit } from '@angular/core';
import { serverTimestamp } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertController } from '@ionic/angular';
import { WarehouseReceipt, WarehouseReceiptContract, WarehouseReceiptGroup } from '@shared/classes/WarehouseReceiptGroup';
import { lastValueFrom } from 'rxjs';
import { SetContractModalComponent } from '../set-contract-modal/set-contract-modal.component';
import { ViewContractDialogComponent } from '../view-contract-dialog/view-contract-dialog.component';

@Component({
  selector: 'app-warehouse-receipt-group-card',
  templateUrl: './warehouse-receipt-group-card.component.html',
  styleUrls: ['../../warehouse-receipts.page.scss'],
})
export class WarehouseReceiptGroupCardComponent implements OnInit {
  @Input() wrGroup: WarehouseReceiptGroup;
  @Input() currentCompany: string;

  public idRange: string;
  public wrIdList: number[];
  public wrList: WarehouseReceipt[];
  public contractRef: string;

  constructor(
    private alertCtrl: AlertController,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.wrList = this.wrGroup.warehouseReceiptList.sort((a, b) => a.id - b.id);
    this.wrIdList = this.wrGroup.warehouseReceiptIdList.sort((a, b) => a - b);
    this.idRange = this.getIdRange();
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
      result += (sub.length === 1 ? sub[0] : `${sub[0]}-${sub[sub.length-1]}`) + (index !== sequence.length - 1 ? `, `: ``);
    });
    return result;
  }

  public viewContractDialog(isPurchase: boolean): void {
    const contractRef = `companies/${this.currentCompany}/warehouseReceipts/${this.wrGroup.ref.id}/${isPurchase ? 'purchaseContract' : 'saleContract'}`;

    this.dialog.open(ViewContractDialogComponent, {
      data: {
        contractRef,
        isPurchase
      },
      autoFocus: false,
      minHeight: '400px',
      minWidth: '400px'
    });
  }

  public uploadWarehouseReceipts(): void {
    console.log("Upload Warehouse Receipts");
  }

  public uploadWarehouseReceipt(): void {
    console.log("Upload a Warehouse Receipt");
  }

  public async cancelGroupConfirmation(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: "Confirmation",
      message: `Are you sure you would like to cancel this Warehouse Receipt Group?`,
      buttons: [
        {
          text: 'yes',
          handler: () => {
            alert.dismiss();
            this.cancelGroup();
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

  public cancelGroup(): void {
    this.wrGroup.update({
      status: "CANCELLED"
    })
    .then(() => {
      this.wrGroup.status = WarehouseReceiptGroup.getStatusType().cancelled;
      this.openSnackbar("Warehouse Receipt Group has been cancelled");
    })
    .catch(error => {
      this.openSnackbar(error, true);
    });
  }

  public isEditable(contract: WarehouseReceiptContract): boolean {
    if (this.wrGroup.status === 'CANCELLED' || this.wrGroup.status === 'CLOSED') return false;
    if (contract?.closedAt === undefined) return true;

    const HOUR_TO_MS = 1000 * 60 * 60;
    const now = new Date().getTime();
    const then = contract?.closedAt?.getTime();

    const hoursSinceCreated = (now - then) / HOUR_TO_MS;
    return hoursSinceCreated < 24 ? true : false;
  }

  public async setContract(contract: WarehouseReceiptContract, isPurchase: boolean): Promise<void> {
    const contractRef = `companies/${this.currentCompany}/warehouseReceipts/${this.wrGroup.ref.id}/${isPurchase ? 'purchaseContract' : 'saleContract'}`;

    const contractData: ContractData = { 
      startDate: new Date(), 
      status: isPurchase ? "CLOSED" : "PENDING",
      pdfReference: null,
      contractRef: contractRef
    };

    if (contract) {
      contractData.basePrice = contract.basePrice;
      contractData.futurePrice = contract.futurePrice;
      contractData.id = contract.id;
      contractData.startDate = contract.startDate;
      contractData.status = contract.status;
      contractData.pdfReference = contract.pdfReference ?? null;
    }

    let updateData = await this.setContractDialog(contractData);
    if (updateData == null) return;

    const contractType = isPurchase ? 'purchaseContract' : 'saleContract';
    const fallback = this.wrGroup[contractType];
  
    updateData = isPurchase ? { ...updateData, closedAt: serverTimestamp() } : updateData;
    delete updateData['contractRef'];

    this.wrGroup.update({
      [contractType]: updateData,
      status: "ACTIVE"
    })
    .then(()=> {
      this.wrGroup[contractType] = { ...updateData, closedAt: new Date() };
      this.wrGroup.status = WarehouseReceiptGroup.getStatusType().active;
      this.openSnackbar("Contract Successfully Updated.");
    })
    .catch(error => {
      this.wrGroup[contractType] = fallback;
      this.openSnackbar(error, true);
    });
  }

  public setContractDialog(contractUpdateDoc: ContractData): any {
    const dailogRef = this.dialog.open(SetContractModalComponent, {
      data: contractUpdateDoc,
      autoFocus: false,
      minHeight: '425px',
      minWidth: '475px'
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

  public async paidWarehouseReceipt(warehouseReceipt: WarehouseReceipt, index: number): Promise<void> {
    if (this.wrGroup.saleContract === null) {
      this.openSnackbar("Error: Sale Contract must be present.", true);
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
    const updateList = this.wrGroup.getRawReceiptList();
    updateList[index].isPaid = true;

    this.wrGroup.update({
      warehouseReceiptList: updateList
    })
    .then(() => {
      this.wrList[index].isPaid = true;
      this.openSnackbar(`Warehouse Receipt has been paid.`);
      this.checkIfAllPaid();
    })
    .catch(error => {
      this.wrList[index].isPaid = false;
      this.openSnackbar(error, true);
    });
  }

  public checkIfAllPaid(): void {
    if (this.hasPaid() !== this.wrList.length) {
      return;
    }

    this.wrGroup.update({
      saleContract: { ...this.wrGroup.saleContract, status: "CLOSED", closedAt: serverTimestamp() },
      status: "CLOSED",
      closedAt: serverTimestamp()
    })
    .then(() => {
      this.wrGroup.saleContract.status = this.wrGroup.status = WarehouseReceiptGroup.getStatusType().closed;
      this.wrGroup.closedAt = new Date();
      this.openSnackbar(`All Warehouse Receipts are paid. Sale Contract and WArehouse Receipt Group are now CLOSED.`);
    })
    .catch(error => {
      this.openSnackbar(error, true);
    })
  }

  public openSnackbar (message: string, error?: boolean): void {
    if (error) {
      this.snackbar.open(message, "Close", { duration: 5000, panelClass: 'snackbar-error' });
      return;
    }
    this.snackbar.open(message, "", { duration: 2000, panelClass: 'snackbar' });
  }
}

interface ContractData {
  basePrice?: number;
  futurePrice?: number;
  id?: string;
  pdfReference?: string;
  startDate: Date;
  status: string;
  contractRef?: string;
}
