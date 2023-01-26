import { IonInfiniteScroll, ModalController, NavController, PopoverController } from '@ionic/angular';
import { ContractModalComponent } from './components/contract-modal/contract-modal.component';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { UntypedFormControl } from '@angular/forms';
import { OptionFilterComponent } from './components/option-filter/option-filter.component';
import { DataContractService } from './../../core/data/data-contract.service';
import { OptionsContractComponent } from './components/options-contract/options-contract.component';
import { Storage } from '@ionic/storage';
import { ContractModalOptionsComponent } from './components/contract-modal-options/contract-modal-options.component';
import { Subscription } from 'rxjs';
import { Firestore, limit, orderBy, query, where } from '@angular/fire/firestore';
import { Contract } from '@shared/classes/contract';
import { Pagination } from '@shared/classes/FirebaseDocInterface';
import { Mass } from '@shared/classes/mass';


@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.page.html',
  styleUrls: ['./contracts.page.scss'],
})
export class ContractsPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public searchIinput = new UntypedFormControl('');
  public ready: boolean = false;
  public sortField: string = "date";
  public assending: boolean = false;
  public dataList: Contract[][] = [];
  public dataListAux: any;
  public listFilter: any = [];
  public activeFilter: boolean;
  public currentCompany: string;
  public contractType: string = "purchaseContracts";
  public orderStatus: string[] = ["active", "closed", "pending", "canceled"];
  public currentSub: Subscription[] = [];
  public contractPagination: Pagination<Contract>;

  private contractLimit = 20;
  private contractStep = 20;

  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private cd: ChangeDetectorRef,
    private dataService: DataContractService,
    private db: Firestore,
    private localStorage: Storage,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.localStorage.get('currentCompany').then(val => {
      this.currentCompany = val;
      this.getContracts();
    })
  }

  ngAfterViewInit() {
  }
  public segmentChanged = (event) => {
    this.orderStatus = event.detail.value.split(',');
    this.getContracts();
  };

  public changedContractType(event){
    this.contractType = event.detail.value;
    this.getContracts();
  };

  public async getContracts() {
    for(const sub of this.currentSub){
      sub.unsubscribe();
    };

    this.currentSub = [];
    this.contractLimit = this.contractStep;
    this.infiniteScroll.disabled = false;
    const ColQuery = query(Contract.getCollectionReference(this.db, this.currentCompany, this.contractType == 'purchaseContracts'),
                    where("status", "in", this.orderStatus),
                    orderBy(this.sortField, this.assending? 'asc': 'desc'),
                    limit(this.contractLimit));

    if(this.contractPagination) this.contractPagination.end();
    this.contractPagination = new Pagination<Contract>(ColQuery, 20);
  };

  public async infiniteContracts(event) {
    this.contractPagination.getNext(snapshot => {
      event.target.complete();
      this.infiniteScroll.disabled = snapshot.docs.length < this.contractStep;
    });
  }

  public openModal = async () => {
    const modal = await this.modalController.create({
      component: ContractModalComponent,
      cssClass: 'modal-contract',
    });
    return await modal.present();
  }

  public openOptionsFilter = async (event, objet?: string, typeObjet?: string) => {
    const popover = await this.popoverController.create({
      component: OptionFilterComponent,
      event,
      cssClass: 'option-filter',
      // showBackdrop: false,
      componentProps: {
        listDataAlter: this.dataList,
        listData: this.dataService.dataContract, objet,
        listFilter: this.listFilter,
        typeObjet
      }
    });
    await popover.present();
    await popover.onDidDismiss().then(result => {
      const data = result.data;
      if (data) {
        this.dataList = result.data.list;
        this.dataListAux = this.dataList;
        this.listFilter = result.data.filter;
        this.activeFilter = true;
        // if (data.filterDate) {

        //   this.dataListAux = this.filterDateRange(result.data.list, data.filterDate);
        // }
        this.cd.markForCheck();
        // } else {
        //   this.dataListAux = this.filterDateRange(data.dataListAux, data.dataDate);
        // }
      }
    });
  }

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

  public openContractOptions= async (event: any, id: string, contract: any) => {
    event.preventDefault();
    let user = await this.localStorage.get('user')
    const popover = await this.popoverController.create({
      component: ContractModalOptionsComponent,
      event,
      dismissOnSelect: true,
      componentProps: {
        contractId: id,
        isPurchase: this.contractType == 'purchaseContracts',
        status: contract.status,
        currentCompany: this.currentCompany,
        userPermissions: user.permissions,
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

  ngOnDestroy(): void {
      this.contractPagination.end();
  }
}
