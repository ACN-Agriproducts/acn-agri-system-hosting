import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IonicModule, NavController } from '@ionic/angular';

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
    private fb: AngularFirestore
    ) { }

  ngOnInit() {}

  public openContractEdit() {
    this.navController.navigateForward(`dashboard/contracts/contract-info/${this.isPurchase? 'purchase' : 'sales'}/${this.contractId}`)
  }

  public acceptContract() {
    if(this.contract.status != "pending") {
      return;
    }

    let type = this.isPurchase? 'purchaseContracts' : 'salesContracts'
    this.fb.doc(`companies/${this.currentCompany}/${type}/${this.contractId}`).update({
      status: "active"
    })
  }

  public closeContract() {
    if(this.contract.status != "active") {
      return;
    }

    let type = this.isPurchase? 'purchaseContracts' : 'salesContracts'
    this.fb.doc(`companies/${this.currentCompany}/${type}/${this.contractId}`).update({
      status: "closed"
    })
  }
}
