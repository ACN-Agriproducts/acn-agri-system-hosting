import { Component, OnInit, Input } from '@angular/core';
import { Firestore, updateDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { NavController } from '@ionic/angular';
import { Contract } from '@shared/classes/contract';
import { UploadDialogData, UploadDocumentDialogComponent } from '@shared/components/upload-document-dialog/upload-document-dialog.component';
import { lastValueFrom } from 'rxjs';
import { CloseContractFieldsDialogComponent } from '../close-contract-fields-dialog/close-contract-fields-dialog.component';

@Component({
  selector: 'app-contract-modal-options',
  templateUrl: './contract-modal-options.component.html',
  styleUrls: ['./contract-modal-options.component.scss'],
})
export class ContractModalOptionsComponent implements OnInit {

  @Input() contractId: string;
  @Input() isPurchase: boolean;
  @Input() status: string;
  @Input() userPermissions: any;
  @Input() currentCompany: string;
  @Input() contract: Contract;

  constructor(
    private db: Firestore,
    private dialog: MatDialog,
    private navController: NavController,
    private snack: SnackbarService,
    private confirm: ConfirmationDialogService,
    private session: SessionInfo
    ) { }

  ngOnInit() {}

  public openContractEdit() {
    this.navController.navigateForward(`dashboard/contracts/contract-info/${this.isPurchase? 'purchase' : 'sales'}/${this.contractId}`)
  }

  public acceptContract() {
    if(this.contract.status != "pending") {
      return;
    }

    const oldStatus = this.contract.status;
    this.contract.status = 'active';
    updateDoc(Contract.getDocRef(this.db, this.currentCompany, this.isPurchase, this.contractId).withConverter(null), {
      status: "active"
    }).then(() => {
      this.snack.open("Contract status updated", "success");
    }).catch(error => {
      console.error(error);
      this.contract.status = oldStatus;
      this.snack.open("Error updating status", "error");
    });
  }

  public async signedContract() {
    const pdfRef = this.contract.pdfReference ?? 
      `/companies/${this.currentCompany}/contracts/${this.isPurchase ? 'purchaseContracts' : 'salesContracts'}/${this.contractId}`;

    const dialogData: UploadDialogData = {
      docType: "Signed Contract",
      hasDoc: this.contract.pdfReference != null,
      pdfRef,
      uploadable: this.contract.status !== 'closed'
    };

    const dialogRef = this.dialog.open(UploadDocumentDialogComponent, {
      data: dialogData,
      autoFocus: false
    });
    const updatePdfRef = await lastValueFrom(dialogRef.afterClosed());
    if (updatePdfRef == null) return;

    this.contract.update({
      pdfReference: updatePdfRef
    })
    .then(() => {
      this.snack.open("Signed Contract Successfully Uploaded", 'success');
    })
    .catch(error => {
      this.snack.open(error, 'error');
    });
  }

  public async closeContract() {
    if(this.contract.status != "active" || !await this.confirm.openDialog("close this contract")) {
      return;
    }

    const requiredFieldData = {
      marketPrice: this.contract.market_price,
      price: this.contract.price.amount,
      priceUnit: this.contract.price.unit,
      quantity: this.contract.quantity.amount,
      quantityUnits: this.contract.quantity.defaultUnits
    };

    console.log(this.contract);
    let newFieldData;
    if (Object.entries(requiredFieldData).some(([key, value]) => (value ?? 0) === 0)) {
      const dialogRef = this.dialog.open(CloseContractFieldsDialogComponent, {
        data: requiredFieldData,
        autoFocus: false
      });
      newFieldData = await lastValueFrom(dialogRef.afterClosed());
      if (newFieldData == null) return;
    }

    this.contract.status = 'closed';
    updateDoc(Contract.getDocRef(this.db, this.currentCompany, this.isPurchase, this.contractId).withConverter(null), {
      status: "closed",
      market_price: newFieldData?.marketPrice ?? requiredFieldData.marketPrice,
      price: newFieldData?.price ?? requiredFieldData.price,
      priceUnit: newFieldData?.priceUnit ?? requiredFieldData.priceUnit,
      quantity: newFieldData?.quantity ?? requiredFieldData.quantity,
      quantityUnits: newFieldData?.quantityUnits ?? requiredFieldData.quantityUnits
    })
    .then(() => {
      this.snack.open("Contract Successfully Closed", "success");
    })
    .catch(error => {
      console.error(error);
      this.contract.status = 'active';
      this.snack.open("Error updating status", "error");
    });
  }

  public async reopen() {
    const oldStatus = this.contract.status;
    this.contract.status = 'active';
    updateDoc(Contract.getDocRef(this.db, this.currentCompany, this.isPurchase, this.contractId).withConverter(null), {
      status: "active"
    }).then(() => {
      this.snack.open("Contract status updated", "success");
    }).catch(error => {
      console.error(error);
      this.contract.status = oldStatus;
      this.snack.open("Error updating status", "error");
    });
  }
}
