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
import { Mass, units } from '@shared/classes/mass';
import { TranslocoService } from '@ngneat/transloco';
import * as Excel from 'exceljs';
import { ContractsService } from '@shared/model-services/contracts.service';
import { MassDisplayPipe } from '@core/pipes/mass/mass-display.pipe';
import { Ticket } from '@shared/classes/ticket';

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
    private contractsService: ContractsService,
    private massDisplayPipe: MassDisplayPipe
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

  public getMassDisplayTooltip(mass: Mass): string {
    return `${this.massDisplayPipe.transform(mass, 3, 'lbs')}
    ${this.massDisplayPipe.transform(mass, 3, 'bu')}
    ${this.massDisplayPipe.transform(mass, 3, 'mTon')}`;
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
    console.log("STARTING SCRIPT...");

    const date = new Date();
    date.setDate(1);

    const toBeDeliveredDataForContracts = await this.getYtdToBeDeliveredDataForContracts(date);
    const workbook = await this.outputYtdDataToExcel(toBeDeliveredDataForContracts, date);

    this.downloadExcel(workbook, date);
  }

  private async getYtdToBeDeliveredDataForContracts(date: Date): Promise<ContractsMap<YtdToBeDeliveredContractData>> {
    const contractsMap: ContractsMap<YtdToBeDeliveredContractData> = {};

    const startDate = new Date(date);
    startDate.setFullYear(startDate.getFullYear() - 1);

    const contracts = await this.contractsService.getList({
      type: ['purchase'],
      orderField: 'date',
      sortOrder: 'asc',
      beforeDate: date,
      afterDate: startDate
    });

    const months = this.getMonths(startDate, date);

    for (const contract of contracts) {
      contractsMap[contract.id] = await this.getYtdContractData(contract, months);
    }

    return contractsMap;
  }

  private getMonths(startDate: Date, endDate: Date): string[] {
    const months = [];
    for (let tempDate = new Date(startDate); tempDate.getTime() < endDate.getTime(); tempDate.setMonth(tempDate.getMonth() + 1)) {
      months.push(tempDate.toLocaleDateString('default', { month: 'short' }));
    }
    return months;
  }

  private async getYtdContractData(contract: Contract, months: string[]): Promise<YtdToBeDeliveredContractData> {
    const unitForData = 'bu';
    const numDecimalPlaces = 3;

    const mapContract: YtdToBeDeliveredContractData = {
      quantity: parseFloat(contract.quantity.getMassInUnit(unitForData).toFixed(numDecimalPlaces)),
      product: contract.product.id,
      closedAt: contract.statusDates.closed,
      toBeDeliveredByMonthMap: {}
    };

    const tickets = await contract.getTickets();
    tickets.sort((a, b) => a.dateIn.getTime() - b.dateIn.getTime());

    const ticketsByMonthMap: { [month: string]: Ticket[]} = {};
    for (const ticket of tickets) {
      const ticketMonth = ticket.dateIn.toLocaleDateString('default', { month: 'short' });
      ticketsByMonthMap[ticketMonth] ??= [];
      ticketsByMonthMap[ticketMonth].push(ticket);
    }

    console.log(`SCANNING CONTRACT #${contract.id}...`)

    let toBeDelivered = contract.quantity.getMassInUnit(unitForData);
    for (let i = -1; i < months.length - 1; i++) {
      const month = months[i+1];

      if (i < (contract.date.getMonth() == 11 ? -1 : contract.date.getMonth())) {
        mapContract.toBeDeliveredByMonthMap[month] = 0;
        continue;
      }

      for (const ticket of ticketsByMonthMap[month] ?? []) {
        ticket.defineBushels(contract.productInfo);
        toBeDelivered -= ticket.net.getMassInUnit(unitForData);
      }

      mapContract.toBeDeliveredByMonthMap[month] = toBeDelivered < 0 ? 0 : parseFloat(toBeDelivered.toFixed(numDecimalPlaces));
    }

    return mapContract;
  }

  private async outputYtdDataToExcel(data: any, date: Date): Promise<Excel.Workbook> {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("YTD To Be Delivered Table");

    worksheet.columns = this.createYtdHeaders(date);

    this.populateYtdWorksheet(worksheet, data);
    this.formatYtdHeaders(worksheet);
    this.formatYtdColumns(worksheet);

    return workbook;
  }

  private createYtdHeaders(date: Date) {
    const columns: Partial<Excel.Column>[] = [
      { header: "Contract ID", key: 'contractId' },
      { header: "Product", key: 'product' },
      { header: "Quantity", key: 'quantity', style: { numFmt: '#,##0.00' } },
      { header: "Closed Date", key: 'closedAt' },
    ];

    const startDate = new Date(date);
    startDate.setFullYear(startDate.getFullYear() - 1);

    for (const month of this.getMonths(startDate, date)) {
      columns.push({ header: month, key: month, style: { numFmt: '#,##0.000;[Red](#,##0);"-";@' } });
    }

    return columns;
  }

  private formatYtdHeaders(worksheet: Excel.Worksheet) {
    const firstRow = worksheet.getRow(1);
    firstRow.alignment = { horizontal: 'center' };
    firstRow.font = { bold: true };
    firstRow.border = { bottom: { style: 'thick'} };
  }

  private formatYtdColumns(worksheet: Excel.Worksheet) {
    worksheet.columns.forEach(column => {
      const lengths = column.values.map(v => v.toString().length);
      const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
      column.width = maxLength > 20 ? 20 : maxLength < 10 ? 10 : maxLength;
    });
  }

  private populateYtdWorksheet(worksheet: Excel.Worksheet, data: ContractsMap<YtdToBeDeliveredContractData>) {
    for (const [id, ytdToBeDeliveredContractData] of Object.entries(data)) {
      const row = {
        contractId: id,
        quantity: ytdToBeDeliveredContractData.quantity,
        product: ytdToBeDeliveredContractData.product,
        closedAt: ytdToBeDeliveredContractData.closedAt?.toLocaleDateString()
      };

      for (const [monthKey, toBeDeliveredValue] of Object.entries(ytdToBeDeliveredContractData.toBeDeliveredByMonthMap)) {
        row[monthKey] = toBeDeliveredValue;
      }

      worksheet.addRow(row);
    }
  }

  private async downloadExcel (workbook: Excel.Workbook, date: Date): Promise<void> {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = `acn_ytd-report_${date.toLocaleDateString('en-US')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}

type ContractsMap<T> = { [contractId: number]: T };
type YtdToBeDeliveredContractData = {
  quantity: number,
  toBeDeliveredByMonthMap: {
    [month: string]: number
  },
  product: string,
  closedAt: Date
}
