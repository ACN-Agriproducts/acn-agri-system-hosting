import { Component, OnInit } from '@angular/core';
import { Firestore, orderBy, where } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contact } from '@shared/classes/contact';
import { ContactInfo, Contract } from '@shared/classes/contract';

@Component({
  selector: 'app-contract-payment-reports',
  templateUrl: './contract-payment-reports.page.html',
  styleUrls: ['./contract-payment-reports.page.scss'],
})
export class ContractPaymentReportsPage implements OnInit {
  public queryDate: Date;
  public clientAccounts: {
    [id: string]: ClientAccount
  };

  public productAccounts: {
    [name: string]: ProductAccount
  };

  public ready = false;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
  ) { }

  ngOnInit() {
    this.queryDate = new Date();
    this.queryDate.setMonth(this.queryDate.getMonth() - 3);
  }

  public async getContracts(): Promise<void> {
    this.ready = false;
    this.clientAccounts = {};
    this.productAccounts = {};

    const contractList = await Contract.getContracts(this.db, this.session.getCompany(), null, where('status', 'in', ['active', 'closed', 'paid']), where('date', '>', this.queryDate));
    
    for(let contract of contractList) {
      let currentClient = this.clientAccounts[contract.clientInfo.ref.id];
      let currentProduct = this.productAccounts[contract.product.id];

      if(!currentClient) {
        currentClient = this.clientAccounts[contract.clientInfo.ref.id] = {
          client: contract.clientInfo,
          contracts: [],
          pendingToPay: 0,
          paid: 0
        };
      }

      if(!currentProduct) {
        currentProduct = this.productAccounts[contract.product.id] = {
          product: contract.product.id,
          contracts: [],
          pendingToPay: 0,
          paid: 0
        }
      }
      
      currentClient.contracts.push(contract);
      currentProduct.contracts.push(contract);
      
      currentClient.paid += contract.totalPayments;
      currentProduct.paid += contract.totalPayments;

      const pendingToPay = (contract.status == "paid") ? 0 : contract.currentDelivered.getMassInUnit(contract.price.getUnit()) * contract.price.amount - contract.totalPayments;
      currentClient.pendingToPay += pendingToPay;
      currentProduct.pendingToPay += pendingToPay;
    }

    this.ready = true
  }
}

interface ClientAccount {
  client: ContactInfo,
  contracts: Contract[],
  pendingToPay: number,
  paid: number
}

interface ProductAccount {
  product: string,
  contracts: Contract[],
  pendingToPay: number,
  paid: number,
}