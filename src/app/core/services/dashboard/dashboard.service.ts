import { Injectable } from '@angular/core';
import { collection, CollectionReference, Firestore, getDocs, limit, orderBy, query } from '@angular/fire/firestore';
import { CompanyService } from '../company/company.service';
import { DashboardData, ProductsMetrics } from '@shared/classes/dashboard-data';
import { ContractsService } from '@shared/model-services/contracts.service';
import { Mass } from '@shared/classes/mass';
import { Contract } from '@shared/classes/contract';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private db: Firestore,
    private company: CompanyService,
    private contractsService: ContractsService,
  ) {}

  public getCollectionReference(): CollectionReference<DashboardData> {
    return collection(this.company.getCompanyReference(), "dashboard-data").withConverter(DashboardData.converter);
  }

  // public async getDashboardData(): Promise<DashboardData> {
  //   const colQuery = query(this.getCollectionReference(), orderBy('date', 'desc'), limit(1));
  //   return getDocs(colQuery).then(result => result.docs[0]?.data());
  // }

  public async getDashboardData(startDate: Date, endDate: Date = new Date()): Promise<{productsMetrics: ProductsMetrics, chartData: any}> {
    this.normalizeDates(startDate, endDate);

    const contracts = await this.contractsService.getList({ afterDate: startDate, beforeDate: endDate });
    const productsMetrics: ProductsMetrics = {};
    const chartData: {
      [productName: string]: {
        salesAmount: {
          name: number,
          value: number
        }[],
        purchasesAmount: {
          name: number,
          value: number
        }[]
      }
    } = {};

    for (const contract of contracts) {
      const productName = contract.product.id;
      const normalizedDate = contract.date;

      productsMetrics[productName] ??= {
        totalSales: 0,
        totalPurchases: 0,
        totalToBeDelivered: new Mass(0, contract.quantity.getUnit(), contract.productInfo),
        totalToBeReceived: new Mass(0, contract.quantity.getUnit(), contract.productInfo),
        totalSalesAmount: new Mass(0, contract.quantity.getUnit(), contract.productInfo),
        totalPurchasesAmount: new Mass(0, contract.quantity.getUnit(), contract.productInfo)
      };

      chartData[productName] ??= {
        salesAmount: [],
        purchasesAmount: []
      };

      for (let i = 0; i < 12; i++) {
        chartData[productName].salesAmount[i] ??= { name: i, value: 0 };
        chartData[productName].purchasesAmount[i] ??= { name: i, value: 0 };
      }

      const productMetrics = productsMetrics[productName];
      if (contract.tags?.includes('sale') || contract.type === 'sales') {
        productMetrics.totalSales += contract.getContractedTotalPrice();
        productMetrics.totalSalesAmount = productMetrics.totalSalesAmount.add(contract.getContractedTotal());
        productMetrics.totalToBeDelivered = productMetrics.totalToBeDelivered.add(contract.getPendingToDeliverOrReceive());

        chartData[productName].salesAmount[contract.date.getMonth()].name = contract.date.getMonth();
        chartData[productName].salesAmount[contract.date.getMonth()].value += contract.getContractedTotal().getMassInUnit('mTon');
      }
      else if (contract.tags?.includes('purchase') || contract.type === 'purchase') {
        productMetrics.totalPurchases += contract.getContractedTotalPrice();
        productMetrics.totalPurchasesAmount = productMetrics.totalPurchasesAmount.add(contract.getContractedTotal());
        productMetrics.totalToBeReceived = productMetrics.totalToBeReceived.add(contract.getPendingToDeliverOrReceive());

        chartData[productName].purchasesAmount[contract.date.getMonth()].name = contract.date.getMonth();
        chartData[productName].purchasesAmount[contract.date.getMonth()].value += contract.getContractedTotal().getMassInUnit('mTon');
      }
    }

    return { productsMetrics, chartData };
  }

  normalizeDates(startDate: Date, endDate: Date = new Date()) {
    startDate.setMonth(startDate.getMonth());
    startDate.setFullYear(startDate.getFullYear());
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    if (endDate < startDate) endDate.setTime(startDate.getTime());

    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setFullYear(endDate.getFullYear());
    endDate.setDate(0);
    endDate.setHours(0, 0, 0, 0);

    const today = new Date();
    if (endDate > today) endDate.setTime(today.getTime());
  }
}
