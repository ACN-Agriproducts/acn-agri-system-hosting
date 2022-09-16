import { Component, OnInit, Input } from '@angular/core';
import { Firestore, updateDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { NavController } from '@ionic/angular';
import { Contract } from '@shared/classes/contract';
import { UploadDialogData, UploadDocumentDialogComponent } from '@shared/components/upload-document-dialog/upload-document-dialog.component';
import { lastValueFrom } from 'rxjs';

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
  @Input() contract: any;

  constructor(
    private db: Firestore,
    private dialog: MatDialog,
    private navController: NavController,
    private snack: SnackbarService,
    ) { }

  ngOnInit() {}

  public openContractEdit() {
    this.navController.navigateForward(`dashboard/contracts/contract-info/${this.isPurchase? 'purchase' : 'sales'}/${this.contractId}`)
  }

  public acceptContract() {
    if(this.contract.status != "pending") {
      return;
    }

    updateDoc(Contract.getDocRef(this.db, this.currentCompany, this.isPurchase, this.contractId).withConverter(null), {
      status: "active"
    })
  }

  public async signedContract() {
    const pdfRef = this.contract.pdfReference ?? 
      `/companies/${this.currentCompany}/contracts/${this.isPurchase ? 'purchaseContract' : 'salesContract'}/${this.contractId}`;

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
      this.snack.openSnackbar("Signed Contract successfully uploaded.", 'success');
    })
    .catch(error => {
      this.snack.openSnackbar(error, 'error');
    });
  }

  public closeContract() {
    if(this.contract.status != "active") {
      return;
    }

    updateDoc(Contract.getDocRef(this.db, this.currentCompany, this.isPurchase, this.contractId).withConverter(null), {
      status: "closed"
    })
  }
}
