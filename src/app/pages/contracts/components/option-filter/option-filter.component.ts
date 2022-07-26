import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { isEqual, isAfter, isBefore, isWithinInterval } from 'date-fns';
@Component({
  selector: 'app-option-filter',
  templateUrl: './option-filter.component.html',
  styleUrls: ['./option-filter.component.scss']
})
export class OptionFilterComponent implements OnInit {
  @Input() objet: string;
  @Input() listData: any;
  @Input() listDataAlter: any;
  @Input() typeObjet: string;
  @Input() filterDate: string;

  @Input() listArrayActive = [];
  public selectAllBand = true;
  public listArray: any;
  public listCancel: any;
  public list;
  @Input() public listFilter: any = [];
  public input = new UntypedFormControl('');
  public dateOnly = new UntypedFormControl('');
  public range = new UntypedFormGroup({
    start: new UntypedFormControl({ value: '', disabled: true }, Validators.required),
    end: new UntypedFormControl({ value: '', disabled: true }, Validators.required),
  });
  constructor(
    private popoverController: PopoverController
  ) {
    this.input.valueChanges.pipe().subscribe(value => {
      this.searching(value);
    });
    this.changeRange();
  }

  public searching = (value?: string) => {
    const result = this.listData.filter((item) => {
      return item[this.objet].toString().trim().toUpperCase().substr(0, value.length) === value.toString().trim().toUpperCase();
    });
    this.listArray = this.listDataFilter(result, true);
    // this.listArray = this.orderArray(this.listArray);
  }
  ngOnInit(): void {
    // this.listArrayActive = this.listDataFilter(this.listDataAlter);
    this.listArray = this.listDataFilter(this.listData, true);
    this.listArray = this.orderArray(this.listArray);
    const lista = this.listData;
    this.listCancel = lista;

  }
  public orderArray = (arrayAux) => {
    return arrayAux.sort(((a, b) => {
      return b.active.toString().localeCompare(a.active.toString());
    }));
  }
  public get isFilter(): boolean {
    return this.listArray.every(item => item.active) || this.list !== this.listData;
  }

  public listDataFilter = (array, order?: boolean) => {
    const arrayAux = [];
    array.map(item => {
      return { name: item[this.objet], active: item.isActive };
    }).reduce((objItems, obj) => {
      if (!objItems[obj.name]) {
        objItems[obj.name] = obj;
        arrayAux.push(obj);

      } else {
        let activeCont = 0;
        arrayAux.filter((itemFilter, index) => {
          activeCont = obj.active ? activeCont + 1 : activeCont - 1;
          if (itemFilter.name === obj.name) {
            itemFilter.active = activeCont > 0 ? true : false;
            arrayAux.splice(index, 1, itemFilter);
          }
        });
      }
      return objItems;
    }, {});
    // console.log(arrayAux);
    // if (order) {

    // }
    return arrayAux;
  }

  public sendAll = () => {
    this.popoverController.dismiss({ list: this.listData, filter: this.listFilter, filterDate: this.filterDate });
  }
  public orderAtoZ = (): void => {
    this.listData.sort(((a, b) => {
      return a[this.objet].toString().localeCompare(b[this.objet].toString());
    }));
    this.listFilter.push({ [this.objet]: 'AtoZ' });
    this.popoverController.dismiss({ list: this.listData, filter: this.listFilter, filterDate: this.filterDate });
  }
  public orderZtoA = (): void => {
    this.listData.sort(((a, b) => {
      return b[this.objet].toString().localeCompare(a[this.objet].toString());
    }));
    this.listFilter.push({ [this.objet]: 'ZtoA' });
    this.popoverController.dismiss({ list: this.listData, filter: this.listFilter, filterDate: this.filterDate });
  }

  public reduceArray = (itemObj) => {
    const list = [];
    this.listData.map((item) => {
      // const active = item[this.objet] !== itemObj.name;
      item.isActive = item[this.objet] === itemObj.name ? !item.isActive : item.isActive;
      list.push(item);
      return null;
    });
    this.listFilter.push({ [this.objet]: itemObj });
    this.list = list;
    // console.log(list);
    // console.log(this.listFilter);
    this.listArray = this.listDataFilter(list, false);
    this.searching(this.input.value);
    // this.popoverController.dismiss({list, filter: this.listFilter });
  }
  public acceptButton = (): void => {
    this.popoverController.dismiss({ list: (this.list) ? this.list : this.listData, filter: this.listFilter, filterDate: this.filterDate });
  }
  public cleanFilter = (): void => {
    const list = [];
    this.listData.map((item) => {
      item.isActive = true;
      list.push(item);
    });
    this.list = list;
    this.listArray = this.listDataFilter(list, true);
    this.searching(this.input.value);
    this.popoverController.dismiss({ list, filter: this.listFilter, filterDate: this.filterDate });

  }
  public selectAll = () => {
    const list = [];
    this.selectAllBand = !this.selectAllBand;
    this.listData.map((item) => {
      item.isActive = this.selectAllBand;
      list.push(item);
      return null;
    });
    this.list = list;
    this.listArray = this.listDataFilter(list, true);
    this.searching(this.input.value);
  }

  public getOnlyDate = (event): void => {
    const date = event.value;
    this.filterDate = date;

    // console.log(array);
  }
  public changeRange = (): void => {
    this.range.valueChanges.subscribe(value => {
      if (value.end && value.start) {
        this.list = this.listData.filter(item => {
          return isWithinInterval(item.dateContract, { start: value.start, end: value.end });
        });
        // this.filterDate = value;
      }
    });
  }
}
