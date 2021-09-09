import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { ContractModalComponent } from './components/contract-modal/contract-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { OptionFilterComponent } from './components/option-filter/option-filter.component';
import { DataContractService } from './../../core/data/data-contract.service';
import { OptionsContractComponent } from './components/options-contract/options-contract.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { ContractModalOptionsComponent } from './components/contract-modal-options/contract-modal-options.component';
import { Observable, Subscription } from 'rxjs';


@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.page.html',
  styleUrls: ['./contracts.page.scss'],
})
export class ContractsPage implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;

  public searchIinput = new FormControl('');
  public ready: boolean = false;
  public sortField: string = "date";
  public assending: boolean = false;
  public dataList: any = [];
  public dataListAux: any;
  public listFilter: any = [];
  public activeFilter: boolean;
  public currentCompany: string;
  public contractType: string = "purchaseContracts";
  public orderStatus: string[] = ["active", "closed", "pending", "canceled"];
  public currentSub: Subscription[] = [];

  constructor(
    private modal: MatDialog,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private cd: ChangeDetectorRef,
    private dataService: DataContractService,
    private db: AngularFirestore,
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
    if(this.currentSub.length > 0) {
      for(const sub of this.currentSub){
        sub.unsubscribe();
      };

      this.currentSub = [];
    }

    this.currentSub.push(this.db.collection(`companies/${this.currentCompany}/${this.contractType}`, ref => 
      ref.where("status", "in", this.orderStatus)
      .orderBy(this.sortField, this.assending? 'asc': 'desc')
    ).valueChanges({idField: 'documentId'}).subscribe(val => {
        this.dataList = val;
        console.log(`companies/${this.currentCompany}/${this.contractType}`);
        console.log(this.dataList);
        this.ready = true;
      }));
  };

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
      console.log(result);
      const data = result.data;
      if (data) {
        console.log(data.filterDate);
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
    console.log("Button pressed");
    const popover = await this.popoverController.create({
      component: ContractModalOptionsComponent,
      event,
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
}
