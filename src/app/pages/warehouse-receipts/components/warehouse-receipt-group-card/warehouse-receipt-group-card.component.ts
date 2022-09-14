import { Component, Input, OnInit } from '@angular/core';
import { serverTimestamp } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { AlertController } from '@ionic/angular';
import { WarehouseReceipt, WarehouseReceiptContract, WarehouseReceiptGroup } from '@shared/classes/WarehouseReceiptGroup';
import { lastValueFrom } from 'rxjs';
import { SetContractModalComponent } from '../set-contract-modal/set-contract-modal.component';
import { UploadWarehouseReceiptDialogComponent } from '../upload-warehouse-receipt-dialog/upload-warehouse-receipt-dialog.component';
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
  public groupRef: string;

  constructor(
    private alertCtrl: AlertController,
    private dialog: MatDialog,
    private snack: SnackbarService,
    private confirmation: ConfirmationDialogService,
  ) { }

  ngOnInit() {
    this.wrList = this.wrGroup.warehouseReceiptList.sort((a, b) => a.id - b.id);
    this.wrIdList = this.wrGroup.warehouseReceiptIdList.sort((a, b) => a - b);
    this.idRange = this.getIdRange();
    this.groupRef = `companies/${this.currentCompany}/warehouseReceipts/${this.wrGroup.ref.id}/`;
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
    const contractRef = this.groupRef + (isPurchase ? 'purchaseContract' : 'saleContract');

    this.dialog.open(ViewContractDialogComponent, {
      data: {
        contractRef,
        isPurchase
      },
      autoFocus: false
    });
  }

  public async uploadWarehouseReceipt(id: number): Promise<void> {
    const receipt = this.wrList.find(receipt => receipt.id === id);

    const hasDoc = receipt.pdfReference != null;
    const pdfRef = receipt.pdfReference != null 
      ? receipt.pdfReference 
      : this.groupRef + `list/warehouseReceipt#${id}`;
    
    const dialogRef = this.dialog.open(UploadWarehouseReceiptDialogComponent, {
      data: {
        pdfRef,
        hasDoc,
        groupStatus: this.wrGroup.status
      },
      autoFocus: false,
    });
    const newPdfRef = await lastValueFrom(dialogRef.afterClosed());
    if (newPdfRef == null) return;

    this.updateWarehouseReceipt(id, newPdfRef);
  }

  public updateWarehouseReceipt(id: number, newPdfRef: any) {
    const newListData = this.wrGroup.getRawReceiptList();
    newListData.find(receipt => receipt.id === id).pdfReference = newPdfRef;

    this.wrGroup.update({
      warehouseReceiptList: newListData
    })
    .then(() => {
      this.wrList.find(receipt => receipt.id === id).pdfReference = newPdfRef;
      this.snack.openSnackbar("Upload Successful", 'success');
    })
    .catch(error => {
      this.snack.openSnackbar(error, 'error');
    });
  }

  public async cancelGroup(): Promise<void> {
    if (!await this.confirmation.openDialog("cancel this Warehouse Receipt Group")) return;

    this.wrGroup.update({
      status: "CANCELLED"
    })
    .then(() => {
      this.wrGroup.status = WarehouseReceiptGroup.getStatusType().cancelled;
      this.snack.openSnackbar("Warehouse Receipt Group has been cancelled.");
    })
    .catch(error => {
      this.snack.openSnackbar(error, 'error');
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
    const contractType = isPurchase ? 'purchaseContract' : 'saleContract';
    const contractRef = this.groupRef + contractType;

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

    const dailogRef = this.dialog.open(SetContractModalComponent, {
      data: contractData,
      autoFocus: false,
      minHeight: '425px',
      minWidth: '475px'
    });
    const newContractData = await lastValueFrom(dailogRef.afterClosed());
    if (newContractData == null) return;

    this.updateContract(newContractData, contractType);
  }

  public updateContract(newContractData: any, contractType: string): void {
    const fallback = this.wrGroup[contractType];
    newContractData = contractType === 'purchaseContract' ? { ...newContractData, closedAt: serverTimestamp() } : newContractData;
    delete newContractData['contractRef'];

    this.wrGroup.update({
      [contractType]: newContractData,
      status: "ACTIVE"
    })
    .then(()=> {
      this.wrGroup[contractType] = { ...newContractData, closedAt: new Date() };
      this.wrGroup.status = WarehouseReceiptGroup.getStatusType().active;
      this.snack.openSnackbar("Contract Successfully Updated", 'success');
    })
    .catch(error => {
      this.wrGroup[contractType] = fallback;
      this.snack.openSnackbar(error, 'error');
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

  public async updatePaidStatus(warehouseReceipt: WarehouseReceipt, index: number): Promise<void> {
    if (this.wrGroup.saleContract === null) {
      this.snack.openSnackbar("Error: Sale Contract must be present.", 'error');
      return;
    }

    if (!await this.confirmation.openDialog(`mark Warehouse Receipt ${warehouseReceipt.id} as paid`)) return;
    this.updateList(index);
  }

  public updateList(index: number) {
    const newListData = this.wrGroup.getRawReceiptList();
    newListData[index].isPaid = true;

    this.wrGroup.update({
      warehouseReceiptList: newListData
    })
    .then(() => {
      this.wrList[index].isPaid = true;
      this.snack.openSnackbar(`Warehouse Receipt has been paid.`, 'success');
      this.checkIfAllPaid();
    })
    .catch(error => {
      this.wrList[index].isPaid = false;
      this.snack.openSnackbar(error, 'error');
    });
  }

  public checkIfAllPaid(): void {
    if (this.hasPaid() !== this.wrList.length) return;

    this.wrGroup.update({
      saleContract: { ...this.wrGroup.saleContract, status: "CLOSED", closedAt: serverTimestamp() },
      status: "CLOSED",
      closedAt: serverTimestamp()
    })
    .then(() => {
      this.wrGroup.saleContract.status = this.wrGroup.status = WarehouseReceiptGroup.getStatusType().closed;
      this.wrGroup.closedAt = new Date();
      this.snack.openSnackbar(`All Warehouse Receipts are paid.\nSale Contract and Warehouse Receipt Group are now CLOSED.`);
    })
    .catch(error => {
      this.snack.openSnackbar(error, 'error');
    })
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
