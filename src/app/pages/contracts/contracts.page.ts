import { IonInfiniteScroll, ModalController, NavController, PopoverController } from '@ionic/angular';
import { ContractModalComponent } from './components/contract-modal/contract-modal.component';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { UntypedFormControl } from '@angular/forms';
import { DataContractService } from './../../core/data/data-contract.service';
import { OptionsContractComponent } from './components/options-contract/options-contract.component';
import { ContractModalOptionsComponent } from './components/contract-modal-options/contract-modal-options.component';
import { Firestore, limit, orderBy, where } from '@angular/fire/firestore';
import { Contract } from '@shared/classes/contract';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { QueryConstraint, startAfter } from 'firebase/firestore';
import { ContractSettings } from '@shared/classes/contract-settings';
import { units } from '@shared/classes/mass';


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
  public orderStatus: string[] = ["active", "closed", "pending", "canceled"];
  public displayUnit: units;

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
    private modalController: ModalController,
    private popoverController: PopoverController,
    private cd: ChangeDetectorRef,
    private dataService: DataContractService,
    private db: Firestore,
    private session: SessionInfo,
    private navController: NavController
  ) { }

  ngAfterViewInit() {
    ContractSettings.getDocument(this.db, this.session.getCompany()).then(settings => {
      const contractsData = Object.entries(settings.contractTypes).map(contract => {
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

      this.tabData = [
        ...contractsData,
        {
          label: "Analytics",
          type: this.cards,
          isInfiniteScrollDisabled: false,
          data: [
            {
              getData: () => Contract.getContracts(this.db, this.session.getCompany(), true, where("status", "==", "active"), orderBy("id", "desc")), 
              title: "Purchase Contracts", 
              contracts: [],
            },
            {
              getData: () => Contract.getContracts(this.db, this.session.getCompany(), false, where("status", "==", "active"), orderBy("id", "desc")), 
              title: "Sales Contracts", 
              contracts: [],
            }
          ]
        }
      ]

      this.getContracts();
    });
    
    this.displayUnit = this.session.getDefaultUnit();
  }

  public segmentChanged(event) {
    this.orderStatus = event.detail.value.split(',');
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
    this.tabIndex = event.detail.value;
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

  public openModal = async () => {
    const modal = await this.modalController.create({
      component: ContractModalComponent,
      cssClass: 'modal-contract',
    });
    return await modal.present();
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
}