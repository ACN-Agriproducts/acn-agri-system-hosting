import { Component, Input, OnInit } from '@angular/core';
import { getDoc } from '@angular/fire/firestore';
import { Contract, ProductInfo } from '@shared/classes/contract';

@Component({
  selector: 'app-display-contract',
  templateUrl: './display-contract.component.html',
  styleUrls: ['./display-contract.component.scss'],
})
export class DisplayContractComponent implements OnInit {
  @Input() contract: Contract;
  public product: any;
  public ready: boolean = false;

  constructor() { }

  ngOnInit() {
    if(this.contract.productInfo && this.contract.clientInfo) {
      this.ready = true;
      this.product = this.contract.productInfo;
      return;
    }

    if(!this.contract.clientInfo) {
      const clientRef = this.contract.client;
      getDoc(clientRef).then(result => {
        this.contract.clientInfo = Contract.clientInfo(result.data());

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
