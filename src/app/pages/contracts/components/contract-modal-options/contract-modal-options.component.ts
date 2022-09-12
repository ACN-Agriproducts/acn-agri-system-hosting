import { Component, OnInit, Input } from '@angular/core';
import { Firestore, updateDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { NavController } from '@ionic/angular';
import { Contract } from '@shared/classes/contract';

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

  public uploadSignedContract() {
    if(this.contract.status == 'closed') return;

    
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
