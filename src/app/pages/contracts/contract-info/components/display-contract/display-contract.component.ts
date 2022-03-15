import { Component, Input, OnInit } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-display-contract',
  templateUrl: './display-contract.component.html',
  styleUrls: ['./display-contract.component.scss'],
})
export class DisplayContractComponent implements OnInit {
  @Input() contract: any;
  public product: any;
  public ready: boolean = false;

  constructor() { }

  ngOnInit() {
    if(this.contract.productInfo && this.contract.clientInfo) {
      this.ready = true;
      this.product = this.contract.productInfo;
      return;
    }

    if(!this.contract.productInfo) {
      const productRef = this.contract.product as DocumentReference;
      productRef.get().then(result => {
        this.contract.productInfo = result.data();
        this.contract.productInfo.name = result.id;

        if(this.contract.productInfo && this.contract.clientInfo) {
          this.ready = true;
          this.product = this.contract.productInfo;
        }
      });
    }

    if(!this.contract.clientInfo) {
      const clientRef = this.contract.client as DocumentReference;
      clientRef.get().then(result => {
        this.contract.clientInfo = result.data()

        if(this.contract.productInfo && this.contract.clientInfo) {
          this.ready = true;
          this.product = this.contract.productInfo;
        }
      });
    }
  }

  setScale() {
  }
}
