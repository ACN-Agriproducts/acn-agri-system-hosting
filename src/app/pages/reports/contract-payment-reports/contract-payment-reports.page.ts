import { Component, OnInit } from '@angular/core';
import { ContactInfo, Contract } from '@shared/classes/contract';
import { ContractsService } from '@shared/model-services/contracts.service';

@Component({
  selector: 'app-contract-payment-reports',
  templateUrl: './contract-payment-reports.page.html',
  styleUrls: ['./contract-payment-reports.page.scss'],
})
export class ContractPaymentReportsPage implements OnInit {
  public queryDate: Date;
  public contractType: "sale" | "purchase" | null;
  public clientAccounts: {
    [id: string]: ClientAccount
  };

  public productAccounts: {
    [name: string]: ProductAccount
  };

  public ready = false;

  constructor(
    private contracts: ContractsService
  ) { }

  ngOnInit() {
    this.queryDate = new Date();
    this.queryDate.setMonth(this.queryDate.getMonth() - 2);
    this.getContracts();
  }

  public async getContracts(): Promise<void> {
    this.ready = false;
    this.clientAccounts = {};
    this.productAccounts = {};

    const contractList = await this.contracts.getList({afterDate: this.queryDate});
    console.log(contractList);
    
    for(let contract of contractList) {
      let currentClient = this.clientAccounts[contract.clientInfo.ref.id] ??= {
        client: contract.clientInfo,
        contracts: [],
        purchase: {
          pendingToPay: 0,
          paid: 0
        },
        sale: {
          pendingToPay: 0,
          paid: 0
        }
      };

      let currentProduct = this.productAccounts[contract.product.id] ??= {
        product: contract.product.id,
        contracts: [],
        purchase: {
          pendingToPay: 0,
          paid: 0
        },
        sale: {
          pendingToPay: 0,
          paid: 0
        }
      };
      
      currentClient.contracts.push(contract);
      currentProduct.contracts.push(contract);

      let type;

      if(contract.tags.includes('sale')) {
        type = 'sale'
      }
      else if(contract.tags.includes('purchase')) {
        type = 'purchase'
      }
      else continue;
      
      currentClient[type].paid += contract.totalPayments;
      currentProduct[type].paid += contract.totalPayments;

      const pending = (contract.status == "paid") ? 0 : contract.currentDelivered.getMassInUnit(contract.price.getUnit()) * contract.price.amount - contract.totalPayments;
      currentClient[type].pendingToPay += pending;
      currentProduct[type].pendingToPay += pending;
    }

    this.ready = true
  }
}

export interface ClientAccount {
  client: ContactInfo,
  contracts: Contract[],
  purchase: {
    pendingToPay: number,
    paid: number
  }
  sale: {
    pendingToPay: number,
    paid: number
  }
}

export interface ProductAccount {
  product: string,
  contracts: Contract[],
  purchase: {
    pendingToPay: number,
    paid: number
  }
  sale: {
    pendingToPay: number,
    paid: number
  }
}

/*
  Headers?
    date
    contractID
    delivered
    quantity
    price
    paid
*/