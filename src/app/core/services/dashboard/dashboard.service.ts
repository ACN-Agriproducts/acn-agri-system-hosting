import { Injectable } from '@angular/core';
import { collection, CollectionReference } from '@angular/fire/firestore';
import { CompanyService } from '../company/company.service';
import { DashboardData, ProductMetrics } from '@shared/classes/dashboard-data';
import { ContractsService } from '@shared/model-services/contracts.service';
import { Mass } from '@shared/classes/mass';

export interface ProductChartData {
  [productName: string]: {
    saleAmounts: {
      name: string;
      value: number;
    }[],
    purchaseAmounts: {
      name: string;
      value: number;
    }[]
  }
}

interface ProductChartDataWithMaps {
  [productName: string]: {
    saleAmounts: Map<string, number>,
    purchaseAmounts: Map<string, number>
  }
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
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

  public async getDashboardData(startDate: Date, endDate: Date = new Date()): Promise<{productMetrics: ProductMetrics, productChartData: ProductChartData}> {
    this.normalizeDates(startDate, endDate);

    const dateRange: string[] = [];
    for (const date = new Date(startDate); date <= endDate; date.setMonth(date.getMonth() + 1)) {
      const dateString = date.toLocaleDateString('en-us', { year: "numeric", month: "short" });
      dateRange.push(dateString);
    }
    
    const contracts = await this.contractsService.getList({ afterDate: startDate, beforeDate: endDate });
    
    const productMetrics: ProductMetrics = {};
    const productChartDataMaps: ProductChartDataWithMaps = {};

    for (const contract of contracts) {
      const productName = contract.product.id;

      const metrics = productMetrics[productName] ??= {
        totalSales: 0,
        totalPurchases: 0,
        totalToBeDelivered: new Mass(0, contract.quantity.getUnit(), contract.productInfo),
        totalToBeReceived: new Mass(0, contract.quantity.getUnit(), contract.productInfo),
        totalSalesAmount: new Mass(0, contract.quantity.getUnit(), contract.productInfo),
        totalPurchasesAmount: new Mass(0, contract.quantity.getUnit(), contract.productInfo)
      };

      productChartDataMaps[productName] ??= {
        saleAmounts: new Map(dateRange.map(date => [date, 0])),
        purchaseAmounts: new Map(dateRange.map(date => [date, 0]))
      };

      const dateString = contract.date.toLocaleDateString('en-us', { year: "numeric", month: "short" });

      if (contract.tags?.includes('sale') || contract.type === 'sales') {
        metrics.totalSales += contract.getContractedTotalPrice();
        metrics.totalSalesAmount = metrics.totalSalesAmount.add(contract.getContractedTotal());
        metrics.totalToBeDelivered = metrics.totalToBeDelivered.add(contract.getPendingToDeliverOrReceive());

        const sales = productChartDataMaps[productName].saleAmounts;
        sales.set(dateString, sales.get(dateString) + contract.getContractedTotal().getMassInUnit('mTon'));
      }
      else if (contract.tags?.includes('purchase') || contract.type === 'purchase') {
        metrics.totalPurchases += contract.getContractedTotalPrice();
        metrics.totalPurchasesAmount = metrics.totalPurchasesAmount.add(contract.getContractedTotal());
        metrics.totalToBeReceived = metrics.totalToBeReceived.add(contract.getPendingToDeliverOrReceive());

        const purchases = productChartDataMaps[productName].purchaseAmounts;
        purchases.set(dateString, purchases.get(dateString) + contract.getContractedTotal().getMassInUnit('mTon'));
      }
    }

    const productChartData: ProductChartData = {};
    for (const productName of Object.keys(productChartDataMaps)) {
      productChartData[productName] ??= {
        saleAmounts: [],
        purchaseAmounts: []
      };

      productChartDataMaps[productName].saleAmounts.forEach((value, name) => { productChartData[productName].saleAmounts.push({ name, value })});
      productChartDataMaps[productName].purchaseAmounts.forEach((value, name) => { productChartData[productName].purchaseAmounts.push({ name, value })});
    }

    return { productMetrics, productChartData };
  }

  public normalizeDates(startDate: Date, endDate: Date = new Date()) {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    if (endDate < startDate) endDate.setTime(startDate.getTime());

    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    endDate.setHours(0, 0, 0, 0);

    const today = new Date();
    if (endDate > today) endDate.setTime(today.getTime());
  }
}
