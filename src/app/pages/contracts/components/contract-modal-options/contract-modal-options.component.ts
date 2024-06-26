import { Component, OnInit, Input } from '@angular/core';
import { Firestore, updateDoc } from '@angular/fire/firestore';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { NavController } from '@ionic/angular';
import { Contract } from '@shared/classes/contract';
import { UploadDialogData, UploadDocumentDialogComponent } from '@shared/components/upload-document-dialog/upload-document-dialog.component';
import { lastValueFrom } from 'rxjs';
import { CloseContractFieldsDialogComponent } from '../close-contract-fields-dialog/close-contract-fields-dialog.component';
import { TranslocoService } from '@ngneat/transloco';

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
    private session: SessionInfo,
    private transloco: TranslocoService
    ) { }

  ngOnInit() {}

  public openContractEdit() {
    this.navController.navigateForward(`dashboard/contracts/contract-info/${this.isPurchase? 'purchase' : 'sales'}/${this.contractId}`)
  }

  public acceptContract() {
    if(this.contract.status != "pending") {
      return;
    }

    this.contract.changeStatus('active').then(() => {
      this.snack.openTranslated("Contract status updated", "success");
    }).catch(error => {
      console.error(error);
      this.snack.openTranslated("Could not update the contract.", "error");
    });
  }

  public async signedContract() {
    const pdfRef = this.contract.pdfReference ?? 
      `/companies/${this.currentCompany}/contracts/${this.isPurchase ? 'purchaseContracts' : 'salesContracts'}/${this.contractId}`;

    const dialogData: UploadDialogData = {
      docType: this.transloco.translate("contracts." + "Signed Contract"),
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
      this.snack.openTranslated("Signed contract uploaded", 'success');
    })
    .catch(error => {
      console.error(error);
      this.snack.openTranslated("Unexpected Error: could not upload the signed contract.", 'error');
    });
  }

  public async closeContract() {
    if(this.contract.status != "active" || !await this.confirm.openWithTranslatedAction("close this contract")) {
      return;
    }

    if(this.contract.isOpen) await this.fixFields(true);

    this.contract.changeStatus('closed').then(() => {
      this.snack.openTranslated("Contract status updated", "success");
    })
    .catch(error => {
      console.error(error);
      this.snack.openTranslated("Could not update the contract status.", "error");
    });
  }

  public async reopen() {
    this.contract.changeStatus('active').then(() => {
      this.snack.openTranslated("Contract status updated", "success");
    }).catch(error => {
      console.error(error);
      this.snack.openTranslated("Could not update the contract status.", "error");
    });
  }

  public async markAsPaid() {
    this.contract.changeStatus('paid').then(() => {
      this.snack.openTranslated("Contract status updated", "success");
    }).catch(error => {
      console.error(error);
      this.snack.openTranslated("Could not update the contract status.", "error");
    });
  }

  public async fixFields(isClosing: boolean = false): Promise<void> {
    const requiredFieldData = {
      marketPrice: this.contract.market_price,
      price: this.contract.price.amount,
      priceUnit: this.contract.price.unit,
      quantity: this.contract.quantity.amount,
      quantityUnits: this.contract.quantity.defaultUnits
    };

    if(this.contract.isOpen && isClosing) {
      requiredFieldData.quantity = this.contract.currentDelivered.amount;
      requiredFieldData.quantityUnits = this.contract.currentDelivered.defaultUnits;
    }

    let newFieldData;
    const dialogRef = this.dialog.open(CloseContractFieldsDialogComponent, {
      data: requiredFieldData,
      autoFocus: false
    });
    newFieldData = await lastValueFrom(dialogRef.afterClosed());
    if (newFieldData == null) return;

    updateDoc(Contract.getDocRef(this.db, this.currentCompany, this.isPurchase, this.contractId).withConverter(null), {
      market_price: newFieldData?.marketPrice ?? requiredFieldData.marketPrice,
      price: newFieldData?.price ?? requiredFieldData.price,
      priceUnit: newFieldData?.priceUnit ?? requiredFieldData.priceUnit,
      quantity: newFieldData?.quantity ?? requiredFieldData.quantity,
      quantityUnits: newFieldData?.quantityUnits ?? requiredFieldData.quantityUnits
    })
    .then(() => {
      this.snack.openTranslated("Contract updated", "success");
      this.contract.market_price = requiredFieldData.marketPrice;
      this.contract.price.amount = requiredFieldData.price;
      this.contract.price.unit = requiredFieldData.priceUnit;
      this.contract.quantity.amount = requiredFieldData.quantity;
      this.contract.quantity.defaultUnits = requiredFieldData.quantityUnits;
    })
    .catch(error => {
      console.error(error);
      this.snack.openTranslated("Could not update the contract.", "error");
    });
  }
}
