import { Component, OnInit, Input } from '@angular/core';
import { Firestore, updateDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { NavController } from '@ionic/angular';
import { Contract } from '@shared/classes/contract';
import { UploadSignedContractComponent } from '@shared/components/upload-signed-contract/upload-signed-contract.component';
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
    private navController: NavController,
    private db: Firestore,
    private dialog: MatDialog,
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
    const hasDoc = this.contract.pdfReference != null;
    const pdfRef = this.contract.pdfReference != null 
      ? this.contract.pdfReference 
      : `/companies/${this.currentCompany}/contracts/${this.isPurchase ? 'purchaseContract' : 'salesContract'}/${this.contractId}`;

    const dialogRef = this.dialog.open(UploadSignedContractComponent, {
      data: {
        pdfRef,
        hasDoc,
        status: this.contract.status
      },
      autoFocus: false
    });
    const updatePdfRef = await lastValueFrom(dialogRef.afterClosed());
    if (updatePdfRef == null) return;

    this.contract.update({
      pdfReference: updatePdfRef
    })
    .then(() => {
      console.log("Contract pdfReference successfully updated.");
    })
    .catch(error => {
      console.log(error);
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
