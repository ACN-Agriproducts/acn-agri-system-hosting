import { FilterComponent } from './../filter/filter.component';
import { FormControl } from '@angular/forms';
import { DataContractService } from './../../../../core/data/data-contract.service';
import { OptionFilterComponent } from './../option-filter/option-filter.component';
import { OptionsContractComponent } from './../options-contract/options-contract.component';
import { PopoverController } from '@ionic/angular';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit {
  public selectText: boolean;
  public number: boolean;
  public customer: boolean;
  public issue: boolean;
  public paid: boolean;
  public billed: boolean;
  public dataList: any;
  public dataListAux: any;
  public listFilter: any = [];
  public activeFilter: boolean;
  public searchIinput = new FormControl('');
  public dataa = [
    {
      numberContract: 396,
      state: 'close',
      name: 'WEST PLAIN',
      period: {
        dateStart: null,
        dateEnd: null,
      },
      destination: 'ACN',
      freight: '',
      product: 'SORGHUM',
      dateContract: new Date('01/29/2020'),
      volumeBushels: 160000,
      priceBushels: 4.549,
      volumeTons: 4064.215, // VOLUMEN BUSHELS * 39.368,
      priceCWT: 8.125,
      priceTons: 179.1238, // priceCWT * 22.046
      totalContract: 727997.36, // volumeTons * priceTons
      priceFreightCWT: 8.1250, // priceCWT * freight
      priceFreightDLLS: 179.1238, // priceFreightCWT * 22.046
      totalFreight: 727997.3583, // volumeTons * priceFreightDLLS
      deliveredVolume: 4064.215,
      volumeDeliver: 0.000, // volumeTons * deliveredVolume
      truck: 0.00,  // volumeDeliver / 25
      isActive: true
    },
    {
      numberContract: 403,
      state: 'cancel',
      name: 'GARY & LAFY SAHA ',
      period: {
        dateStart: null,
        dateEnd: null,
      },
      destination: 'ACN',
      freight: '',
      product: 'YELLOW CORN',
      dateContract: new Date('05/20/2020'),
      volumeBushels: 0,
      priceBushels: 0,
      volumeTons: 0, // VOLUMEN BUSHELS * 39.368,
      priceCWT: 0,
      priceTons: 0, // priceCWT * 22.046
      totalContract: 0, // volumeTons * priceTons
      priceFreightCWT: 0, // priceCWT * freight
      priceFreightDLLS: 0, // priceFreightCWT * 22.046
      totalFreight: 0, // volumeTons * priceFreightDLLS
      deliveredVolume: 0,
      volumeDeliver: 0.000, // volumeTons * deliveredVolume
      truck: 0.00,  // volumeDeliver / 25
      isActive: true
    },
    {
      numberContract: 403,
      state: 'cancel',
      name: 'MEX AGRO',
      period: {
        dateStart: null,
        dateEnd: null,
      },
      destination: 'ACN',
      freight: '',
      product: 'YELLOW CORN',
      dateContract: new Date('06/03/2020'),
      volumeBushels: 0,
      priceBushels: 0,
      volumeTons: 0, // VOLUMEN BUSHELS * 39.368,
      priceCWT: 0,
      priceTons: 0, // priceCWT * 22.046
      totalContract: 0, // volumeTons * priceTons
      priceFreightCWT: 0, // priceCWT * freight
      priceFreightDLLS: 0, // priceFreightCWT * 22.046
      totalFreight: 0, // volumeTons * priceFreightDLLS
      deliveredVolume: 0,
      volumeDeliver: 0.000, // volumeTons * deliveredVolume
      truck: 0.00,  // volumeDeliver / 25
      isActive: true
    },
    {
      numberContract: 405,
      state: 'close',
      name: ' ROMULADO SOLIS JR',
      period: {
        dateStart: null,
        dateEnd: null,
      },
      destination: 'ACN',
      freight: '',
      product: 'SORGHUM',
      dateContract: new Date('06/04/2020'),
      volumeBushels: 19683.92,
      priceBushels: 3.752,
      volumeTons: 499.998, // VOLUMEN BUSHELS * 39.368,
      priceCWT: 6.7,
      priceTons: 147.7082, // priceCWT * 22.046
      totalContract: 73853.80, // volumeTons * priceTons
      priceFreightCWT: 6.7000, // priceCWT * freight
      priceFreightDLLS: 147.7082, // priceFreightCWT * 22.046
      totalFreight: 73853.7998, // volumeTons * priceFreightDLLS
      deliveredVolume: 496.313,
      volumeDeliver: 3.685, // volumeTons * deliveredVolume
      truck: 0.15, // volumeDeliver / 25
      isActive: true
    },
    {
      numberContract: 406,
      state: 'close',
      name: 'HOVDA FARMS',
      period: {
        dateStart: null,
        dateEnd: null,
      },
      destination: 'ACN',
      freight: '',
      product: 'SORGHUM',
      dateContract: new Date('06/17/2020'),
      volumeBushels: 1785.714,
      priceBushels: 3.836,
      volumeTons: 45.360, // VOLUMEN BUSHELS * 39.368,
      priceCWT: 6.85,
      priceTons: 151.0151, // priceCWT * 22.046
      totalContract: 6849.97, // volumeTons * priceTons
      priceFreightCWT: 6.8500, // priceCWT * freight
      priceFreightDLLS: 151.0151, // priceFreightCWT * 22.046
      totalFreight: 6849.9740, // volumeTons * priceFreightDLLS
      deliveredVolume: 64.546,
      volumeDeliver: -19.186, // volumeTons * deliveredVolume
      truck: -0.77, // volumeDeliver / 25
      isActive: true
    },
    {
      numberContract: 480,
      state: 'active',
      name: 'JOSEPH MATSON',
      period: {
        dateStart: new Date('10/1/2020'),
        dateEnd: new Date('12/31/2020'),
      },
      destination: 'FOB',
      freight: 1.05,
      product: 'YELLOW CORN',
      dateContract: new Date('09/09/2020'),
      volumeBushels: 20000.00,
      priceBushels: 3.83,
      volumeTons: 508.027, // VOLUMEN BUSHELS * 39.368,
      priceCWT: 6.84,
      priceTons: 150.7946, // priceCWT * 22.046
      totalContract: 76607.72, // volumeTons * priceTons
      priceFreightCWT: 7.8900, // priceCWT * freight
      priceFreightDLLS: 173.9429, // priceFreightCWT * 22.046
      totalFreight: 88367.6793, // volumeTons * priceFreightDLLS
      deliveredVolume: 488.353,
      volumeDeliver: 19.674, // volumeTons * deliveredVolume
      truck: 0.79,  // volumeDeliver / 25
      isActive: true
    },
    {
      numberContract: 484,
      state: 'active',
      name: 'COASTAL BEND COOP GIN',
      period: {
        dateStart: new Date('11/09/2020'),
        dateEnd: new Date('11/10/2020'),
      },
      destination: 'FOB CORPUS CHRISTI',
      freight: 0,
      product: 'RAW COTTONSEED',
      dateContract: new Date('09/11/2020'),
      volumeBushels: 19684.00,
      priceBushels: '',
      volumeTons: 500.000, // VOLUMEN BUSHELS * 39.368,
      priceCWT: 8.6183,
      priceTons: 190.000, // priceCWT * 22.046
      totalContract: 95000.00, // volumeTons * priceTons
      priceFreightCWT: 8.6183, // priceCWT * freight
      priceFreightDLLS: 189.9990, // priceFreightCWT * 22.046
      totalFreight: 94999.5209, // volumeTons * priceFreightDLLS
      deliveredVolume: 474.414,
      volumeDeliver: 25.586, // volumeTons * deliveredVolume
      truck: 1.02,      // volumeDeliver / 25
      isActive: true
    }
  ];
  constructor(
    private dataService: DataContractService,
    private popoverController: PopoverController,
    private cd: ChangeDetectorRef,
  ) {
    this.searchIinput.valueChanges.subscribe(value => {
      // this.dataListAux = this.dataList.filter((item) => {
      //   return item.name.toString().trim().toUpperCase().substr(0, value.length)
      //     === value.toString().trim().toUpperCase()
      //     || item.product.toString().trim().toUpperCase().substr(0, value.length)
      //     === value.toString().trim().toUpperCase();
      // });
      this.searching(value);
      // console.log(result);

    });
  }

  public searching = (value) => {
    this.dataListAux = this.dataList.filter((item) => {
      return item.name.toString().trim().toUpperCase().substr(0, value.length)
        === value.toString().trim().toUpperCase()
        || item.product.toString().trim().toUpperCase().substr(0, value.length)
        === value.toString().trim().toUpperCase()
        || item.destination.toString().trim().toUpperCase().substr(0, value.length)
        === value.toString().trim().toUpperCase();
    });
  }

  ngOnInit(): void {
    // this.dataList = this.data;
    this.dataList = this.dataService.dataContract;
    this.dataListAux = this.dataList;
  }

  public openOptions = async (event) => {
    const popover = await this.popoverController.create({
      component: OptionsContractComponent,
      event,
      cssClass: 'option-contract'
    });
    await popover.present();
  }
  public openOptionsFilter = async (event, objet?: string, isCurrency?: string) => {
    const popover = await this.popoverController.create({
      component: OptionFilterComponent,
      event,
      // cssClass: 'option-contract',
      // showBackdrop: false,
      componentProps: {
        listDataAlter: this.dataList,
        listData: this.dataService.dataContract, objet,
        listFilter: this.listFilter,
        isCurrency
      }
    });
    await popover.present();
    await popover.onDidDismiss().then(result => {
      console.log(result);
      if (result.data) {
        this.dataList = result.data.list;
        this.dataListAux = this.dataList;
        this.listFilter = result.data.filter;
        this.activeFilter = true;
        this.searching(this.searchIinput.value);
        this.cd.markForCheck();
      }
    });
  }

  public openFilter = async (event) => {
    const popover = await this.popoverController.create({
      component: FilterComponent,
      event,
      cssClass: 'filter-form'
    });
    await popover.present();
    await popover.onDidDismiss().then(result => {
      if (result) {

      }
    });
  }

}
