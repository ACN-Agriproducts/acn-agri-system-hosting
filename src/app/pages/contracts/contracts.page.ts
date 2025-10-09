import { IonInfiniteScroll, NavController, PopoverController } from '@ionic/angular';
import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { UntypedFormControl } from '@angular/forms';
import { OptionsContractComponent } from './components/options-contract/options-contract.component';
import { ContractModalOptionsComponent } from './components/contract-modal-options/contract-modal-options.component';
import { Firestore, limit, orderBy, where } from '@angular/fire/firestore';
import { Contract } from '@shared/classes/contract';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { QueryConstraint, startAfter } from 'firebase/firestore';
import { ContractSettings } from '@shared/classes/contract-settings';
import { units } from '@shared/classes/mass';
import { TranslocoService } from '@ngneat/transloco';
import * as Excel from 'exceljs';
import { ContractsService } from '@shared/model-services/contracts.service';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.page.html',
  styleUrls: ['./contracts.page.scss'],
})
export class ContractsPage implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("infiniteScroll") infiniteScroll: IonInfiniteScroll;
  @ViewChild("cards") cards: TemplateRef<any>;
  @ViewChild("tableTemplate") table: TemplateRef<any>;

  public searchIinput = new UntypedFormControl('');
  public ready: boolean = false;
  public sortField: string = "date";
  public assending: boolean = false;
  public listFilter: any = [];
  public activeFilter: boolean;
  public orderStatus: string[] = ["active", "closed", "pending", "canceled", "paid"];
  public displayUnit: units;
  public exportMode: boolean = false;
  public exportList: Set<Contract>;

  public tabData: {
    label: string;
    type: TemplateRef<any>;
    isInfiniteScrollDisabled: boolean;
    data: {
      //ref: CollectionReference<Contract>;
      getData: (constraints: QueryConstraint[]) => Promise<Contract[]>;
      title?: string;
      contracts: Promise<Contract[]>[];
    }[]
  }[];
  public tabIndex: number = 0;

  private contractStep = 20;

  constructor(
    private popoverController: PopoverController,
    private db: Firestore,
    private session: SessionInfo,
    private navController: NavController,
    private transloco: TranslocoService,
    private contractsService: ContractsService
  ) { }

  ngAfterViewInit() {
    this.exportList = new Set<Contract>();
    ContractSettings.getDocument(this.db, this.session.getCompany()).then(settings => {
      this.tabData = Object.entries(settings.contractTypes).map(contract => {
        return {
          label: contract[0],
          type: this.table,
          isInfiniteScrollDisabled: false,
          data: [
            {
              getData: (constraints: QueryConstraint[]) => Contract.getContracts(this.db, this.session.getCompany(), contract[1], ...constraints), 
              contracts: [],
            }
          ]
        }
      });

      this.tabData.push({
        label: "all",
        type: this.table,
        isInfiniteScrollDisabled: false,
        data: [
          {
            getData: (constraints: QueryConstraint[]) => Contract.getContracts(this.db, this.session.getCompany(), null, ...constraints), 
            contracts: [],
          }
        ]
      },
      {
        label: "analytics",
        type: this.cards,
        isInfiniteScrollDisabled: false,
        data: Object.entries(settings.contractTypes).map(contract => {
          return {
            getData: () => Contract.getContracts(this.db, this.session.getCompany(), contract[1], where('status', '==', 'active'), orderBy('id', 'desc')),
            title: contract[0],
            contracts: []
          }
        })
      });

      this.getContracts();
    });
    
    this.displayUnit = this.session.getDisplayUnit();
  }

  public segmentChanged(event) {
    this.orderStatus = event.value.split(',');
    this.tabData.forEach(tab => {
      if(tab.type != this.table) {
        return;
      }

      tab.isInfiniteScrollDisabled = false;
      tab.data.forEach(data => {
        data.contracts = [];
      });
    });
    this.getContracts();
  };

  public changedContractType(event) {
    this.tabIndex = event.value;
    this.getContracts();
  };

  public async getContracts() {
    const currentTabData = this.tabData[this.tabIndex];
    if(this.infiniteScroll) this.infiniteScroll.disabled = currentTabData.isInfiniteScrollDisabled;
    
    currentTabData.data.forEach(data => {
      if(data.contracts.length == 0) {
        data.contracts.push(
          data.getData([
            where("status", "in", this.orderStatus),
            orderBy(this.sortField, this.assending? 'asc': 'desc'),
            limit(this.contractStep)
          ])
        );
      }
    });
  };

  public async infiniteContracts(event) {
    const currentTabData = this.tabData[this.tabIndex];
    const promises = [];

    for(let data of currentTabData.data) {
      const lastContracts = await data.contracts[data.contracts.length - 1];
      const promise = data.getData([        
        where("status", "in", this.orderStatus),
        orderBy(this.sortField, this.assending? 'asc': 'desc'),
        startAfter(lastContracts?.[lastContracts.length - 1].snapshot),
        limit(this.contractStep)
      ]);

      promises.push(promise);
      data.contracts.push(promise);
    }

    const snapshot = await Promise.all(promises);
    event.target.complete();
    this.infiniteScroll.disabled = currentTabData.isInfiniteScrollDisabled = snapshot[0].length < this.contractStep;
  }

  // public openOptionsFilter = async (event, objet?: string, typeObjet?: string) => {
  //   const popover = await this.popoverController.create({
  //     component: OptionFilterComponent,
  //     event,
  //     cssClass: 'option-filter',
  //     // showBackdrop: false,
  //     componentProps: {
  //       listDataAlter: this.dataList,
  //       listData: this.dataService.dataContract, objet,
  //       listFilter: this.listFilter,
  //       typeObjet
  //     }
  //   });
  //   await popover.present();
  //   await popover.onDidDismiss().then(result => {
  //     const data = result.data;
  //     if (data) {
  //       this.dataList = result.data.list;
  //       this.dataListAux = this.dataList;
  //       this.listFilter = result.data.filter;
  //       this.activeFilter = true;
  //       // if (data.filterDate) {

  //       //   this.dataListAux = this.filterDateRange(result.data.list, data.filterDate);
  //       // }
  //       this.cd.markForCheck();
  //       // } else {
  //       //   this.dataListAux = this.filterDateRange(data.dataListAux, data.dataDate);
  //       // }
  //     }
  //   });
  // }

  public openOptions = async (event) => {
    const popover = await this.popoverController.create({
      component: OptionsContractComponent,
      event,
      cssClass: 'option-contract'
    });
    await popover.present();
  }

  public sortList(field: string) {
    if(this.sortField == field){
      this.assending = false;
    } else {
      this.sortField = field;
      this.assending = true;
    }

    this.getContracts();
  }

  public newContractButton() {
    this.navController.navigateForward('dashboard/contracts/new-contract')
  }

  public exportButton() {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(this.tableTranslate('Contracts'));
    const contractsTable = worksheet.addTable({
      name: 'contract_table',
      ref: 'A1',
      headerRow: true,
      style: {
        theme: "TableStyleMedium2",
        showRowStripes: true,
      },
      columns: [
        {name: this.tableTranslate("ID"), filterButton: true},
        {name: this.tableTranslate("Contract Type"), filterButton: true},
        {name: this.tableTranslate("Customer"), filterButton: true},
        {name: this.tableTranslate("Date"), filterButton: true},
        {name: this.tableTranslate("Status"), filterButton: true},
        {name: this.tableTranslate("Product"), filterButton: true},
        {name: `${this.tableTranslate("Delivered")} (${this.displayUnit})`, filterButton: true},
        {name: `${this.tableTranslate("Quantity")} (${this.displayUnit})`, filterButton: true},
        {name: `${this.tableTranslate("Price")} ($/bu)`, filterButton: true},
        {name: `${this.tableTranslate("Price")} ($/${this.displayUnit})`, filterButton: true}
      ],
      rows:[]
    });

    [...this.exportList].forEach(contract => {
      contractsTable.addRow([
        contract.id,
        this.tableTranslate(contract.type),
        contract.clientName,
        contract.date,
        this.tableTranslate(contract.status.toString()),
        contract.product.id,
        contract.currentDelivered.getMassInUnit(this.displayUnit),
        contract.quantity.getMassInUnit(this.displayUnit),
        contract.pricePerBushel,
        contract.price.getPricePerUnit(this.displayUnit, contract.quantity)
      ]);
    });
    contractsTable.commit();

    worksheet.columns.forEach(column => {
      let maxLength = 0;

      column.eachCell({ includeEmpty: false }, cell => {
        const cellLength = (cell.value ?? null) instanceof Date 
          ? cell.value?.toLocaleString().split(' ')[0].length ?? 10 
          : cell.value?.toLocaleString().length ?? 10;
          
        if (maxLength < cellLength) maxLength = cellLength;
      });

      column.width = maxLength < 10 ? 10 : maxLength > 35 ? 35 : maxLength;
    });

    
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("style", "display: none");
      a.href = url;
      a.download = `CONTRACTS-EXPORT.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    });
  }

  public openContractOptions= async (event: any, contract: Contract) => {
    event.preventDefault();
    const popover = await this.popoverController.create({
      component: ContractModalOptionsComponent,
      event,
      dismissOnSelect: true,
      componentProps: {
        contractId: contract.ref.id,
        isPurchase: contract.ref.parent.id == 'purchaseContracts',
        status: contract.status,
        currentCompany: this.session.getCompany(),
        userPermissions: this.session.getPermissions(),
        contract: contract
      }
    })
    await popover.present();
  }

  public getDeliveredTooltip(contract: Contract): string {
    const weight = contract.currentDelivered;

    return `${weight.getMassInUnit('lbs').toFixed(3)} lbs
    ${weight.getBushelWeight(contract.productInfo).toFixed(3)} bu
    ${weight.getMassInUnit('mTon').toFixed(3)} mTon`
  }

  public getQuantityTooltip(contract: Contract): string {
    const weight = contract.quantity;

    return `${weight.getMassInUnit('lbs').toFixed(3)} lbs
    ${weight.getBushelWeight(contract.productInfo).toFixed(3)} bu
    ${weight.getMassInUnit('mTon').toFixed(3)} mTon`
  }

  public exportSelect(checked: any, contract: Contract) {
    if(checked) this.exportList.add(contract);
    else this.exportList.delete(contract);
  }

  public getPriceTooltip(contract: Contract): string {
    const price = contract.price;

    return `$${price.getPricePerUnit('lbs', contract.quantity)?.toFixed(3) ?? "-"} lbs
    $${price.getPricePerUnit('bu', contract.quantity)?.toFixed(3) ?? "-"} bu
    $${price.getPricePerUnit('mTon', contract.quantity)?.toFixed(3) ?? "-"} mTon`;
  }

  public tableTranslate(key: string): string {
    return this.transloco.translate("contracts.table." + key);
  }

  public async tempContractScript() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

    const contractsByMonthMap: {
      [month: string]: {
        contracts: { contract: Contract, toBeDelivered: number }[],
        toBeDeliveredTotal: number
      }
    } = {};

    const contracts = await this.contractsService.getList({
      type: ['purchase'],
      orderField: 'date',
      sortOrder: 'asc',
      afterDate: new Date('10/7/2024'),
      beforeDate: new Date()
    });

    contracts.forEach(contract => {
      const month = months[contract.date.getMonth()];

      if (!contractsByMonthMap[month]) contractsByMonthMap[month] = {
        contracts: [],
        toBeDeliveredTotal: 0
      };

      const toBeDelivered = contract.quantity.subtract(contract.currentDelivered).get();

      contractsByMonthMap[month].contracts.push({ contract, toBeDelivered });
      contractsByMonthMap[month].toBeDeliveredTotal += toBeDelivered;
    });

    console.log(contractsByMonthMap)
  }
}