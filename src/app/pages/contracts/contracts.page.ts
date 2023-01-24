import { IonInfiniteScroll, ModalController, NavController, PopoverController } from '@ionic/angular';
import { ContractModalComponent } from './components/contract-modal/contract-modal.component';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { UntypedFormControl } from '@angular/forms';
import { DataContractService } from './../../core/data/data-contract.service';
import { OptionsContractComponent } from './components/options-contract/options-contract.component';
import { ContractModalOptionsComponent } from './components/contract-modal-options/contract-modal-options.component';
import { CollectionReference, Firestore, getDocs, limit, orderBy, query, QuerySnapshot, where } from '@angular/fire/firestore';
import { Contract } from '@shared/classes/contract';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { startAfter } from 'firebase/firestore';


@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.page.html',
  styleUrls: ['./contracts.page.scss'],
})
export class ContractsPage implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("infiniteScroll") infiniteScroll: IonInfiniteScroll;
  @ViewChild("cards") cards: TemplateRef<any>;
  @ViewChild("table") table: TemplateRef<any>;

  public searchIinput = new UntypedFormControl('');
  public ready: boolean = false;
  public sortField: string = "date";
  public assending: boolean = false;
  public listFilter: any = [];
  public activeFilter: boolean;
  public orderStatus: string[] = ["active", "closed", "pending", "canceled"];

  public tabData: {
    label: string;
    type: TemplateRef<any>;
    isInfiniteScrollDisabled: boolean;
    data: {
      ref: CollectionReference<Contract>;
      title?: string;
      contracts: Promise<QuerySnapshot<Contract>>[];
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
    this.tabData = [{
      label: "Purchase Contracts",
      type: this.table,
      isInfiniteScrollDisabled: false,
      data: [
        {
          ref: Contract.getCollectionReference(this.db, this.session.getCompany(), true), 
          contracts: [],
        }
      ]
    },{
      label: "Sales Contracts",
      type: this.table,
      isInfiniteScrollDisabled: false,
      data: [
        {
          ref: Contract.getCollectionReference(this.db, this.session.getCompany(), false), 
          contracts: [],
        }
      ]
    },{
      label: "Analytics",
      type: this.cards,
      isInfiniteScrollDisabled: false,
      data: [
        {
          ref: Contract.getCollectionReference(this.db, this.session.getCompany(), true), 
          title: "Purchase Contracts", 
          contracts: [],
        },
        {
          ref: Contract.getCollectionReference(this.db, this.session.getCompany(), false), 
          title: "Purchase Contracts", 
          contracts: [],
        }
      ]
    }];

    this.getContracts();
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
        let dbQuery = query(
          data.ref,
          orderBy(this.sortField, this.assending? 'asc': 'desc'),
          limit(this.contractStep)
        );

        if(currentTabData.type == this.table) {
          dbQuery = query(dbQuery, where("status", "in", this.orderStatus))
        }
        else if(currentTabData.type == this.cards) {
          dbQuery = query(dbQuery, where("status", "==", "active"))
        }

        const promise = getDocs(dbQuery);
        data.contracts.push(promise);
      }
    });
  };

  public async infiniteContracts(event) {
    const currentTabData = this.tabData[this.tabIndex];
    const promises = [];

    for(let data of currentTabData.data) {
      const lastContracts = await data.contracts[data.contracts.length - 1];

      const dbQuery = query(
        data.ref,
        where("status", "in", this.orderStatus),
        orderBy(this.sortField, this.assending? 'asc': 'desc'),
        startAfter(lastContracts.docs?.[lastContracts.docs.length - 1]),
        limit(this.contractStep)
      );
      
      const promise = getDocs(dbQuery);

      promises.push(promise);
      data.contracts.push(promise);
    }

    const snapshot = await Promise.all(promises);
    event.target.complete();
    this.infiniteScroll.disabled = currentTabData.isInfiniteScrollDisabled = snapshot[0].docs.length < this.contractStep;
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