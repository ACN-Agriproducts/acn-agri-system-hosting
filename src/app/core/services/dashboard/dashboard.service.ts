import { Injectable } from '@angular/core';
import { collection, CollectionReference, Firestore, getDocs, limit, orderBy, query } from '@angular/fire/firestore';
import { CompanyService } from '../company/company.service';
import { DashboardData, ProductMetricsMap } from '@shared/classes/dashboard-data';
import { ContractsService } from '@shared/model-services/contracts.service';
import { Mass } from '@shared/classes/mass';
import { Contract } from '@shared/classes/contract';

interface ProductChartData {
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

  public async getDashboardData(startDate: Date, endDate: Date = new Date()): Promise<{productMetricsMap: ProductMetricsMap, productChartData: ProductChartData}> {
    this.normalizeDates(startDate, endDate);

    const dateRange: string[] = [];
    for (const date = new Date(startDate); date <= endDate; date.setMonth(date.getMonth() + 1)) {
      const dateString = date.toLocaleDateString('en-us', { year: "numeric", month: "short" });
      dateRange.push(dateString);
    }
    
    const contracts = await this.contractsService.getList({ afterDate: startDate, beforeDate: endDate });
    
    const productMetricsMap: ProductMetricsMap = {};
    const productChartDataMap: ProductChartDataWithMaps = {};

    for (const contract of contracts) {
      const productName = contract.product.id;

      productMetricsMap[productName] ??= {
        totalSales: 0,
        totalPurchases: 0,
        totalToBeDelivered: new Mass(0, contract.quantity.getUnit(), contract.productInfo),
        totalToBeReceived: new Mass(0, contract.quantity.getUnit(), contract.productInfo),
        totalSalesAmount: new Mass(0, contract.quantity.getUnit(), contract.productInfo),
        totalPurchasesAmount: new Mass(0, contract.quantity.getUnit(), contract.productInfo)
      };

      productChartDataMap[productName] ??= {
        saleAmounts: new Map(dateRange.map(date => [date, 0])),
        purchaseAmounts: new Map(dateRange.map(date => [date, 0]))
      };

      const dateString = contract.date.toLocaleDateString('en-us', { year: "numeric", month: "short" });
      const productMetrics = productMetricsMap[productName];

      if (contract.tags?.includes('sale') || contract.type === 'sales') {
        productMetrics.totalSales += contract.getContractedTotalPrice();
        productMetrics.totalSalesAmount = productMetrics.totalSalesAmount.add(contract.getContractedTotal());
        productMetrics.totalToBeDelivered = productMetrics.totalToBeDelivered.add(contract.getPendingToDeliverOrReceive());

        const sales = productChartDataMap[productName].saleAmounts;
        sales.set(dateString, sales.get(dateString) + contract.getContractedTotal().getMassInUnit('mTon'));
      }
      else if (contract.tags?.includes('purchase') || contract.type === 'purchase') {
        productMetrics.totalPurchases += contract.getContractedTotalPrice();
        productMetrics.totalPurchasesAmount = productMetrics.totalPurchasesAmount.add(contract.getContractedTotal());
        productMetrics.totalToBeReceived = productMetrics.totalToBeReceived.add(contract.getPendingToDeliverOrReceive());

        const purchases = productChartDataMap[productName].purchaseAmounts;
        purchases.set(dateString, purchases.get(dateString) + contract.getContractedTotal().getMassInUnit('mTon'));
      }
    }

    const productChartData: ProductChartData = {};
    for (const productName of Object.keys(productChartDataMap)) {
      productChartData[productName] ??= {
        saleAmounts: [],
        purchaseAmounts: []
      };

      productChartDataMap[productName].saleAmounts.forEach((value, name) => { productChartData[productName].saleAmounts.push({ name, value })});
      productChartDataMap[productName].purchaseAmounts.forEach((value, name) => { productChartData[productName].purchaseAmounts.push({ name, value })});
    }

    return { productMetricsMap, productChartData };
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
