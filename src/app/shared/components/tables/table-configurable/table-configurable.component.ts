import { Component, ContentChild, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CollectionReference, getCountFromServer, getDocs, limit, OrderByDirection, query, QueryConstraint, QuerySnapshot, startAfter, where } from '@angular/fire/firestore';
import { MatSelectChange } from '@angular/material/select';
import { FirebaseDocInterface } from '@shared/classes/FirebaseDocInterface';
import { IonInfiniteScroll, NavController, PopoverController } from '@ionic/angular';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { orderBy, QueryDocumentSnapshot } from 'firebase/firestore';
import { FilterPopoverComponent } from '../filter-popover/filter-popover.component';

@Component({
  selector: 'app-configurable-table',
  templateUrl: './table-configurable.component.html',
  styleUrls: ['./table-configurable.component.scss'],
})
export class TableConfigurableComponent implements OnInit {
  @ContentChild('headers') headers!: TemplateRef<any>;
  @ContentChild('rows') rows!: TemplateRef<any>;
  @ContentChild('status') status: TemplateRef<any>;

  @Input() private collRef!: CollectionReference<FirebaseDocInterface>;
  @Input() public displayFormat!: string;
  @Input() public rowAction?: (document: QueryDocumentSnapshot<FirebaseDocInterface>) => void = () => {};
  @Input() public steps!: number;
  @Input() public fixedHeight!: boolean;

  @ViewChild('infiniteScroll') private infiniteScroll: IonInfiniteScroll;

  public count: number = 0;
  public dataList: Promise<QuerySnapshot<FirebaseDocInterface>>[] = [];
  public pageIndex: number = 0;
  public defaultSize: number;
  public details: string;
  
  private filterConstraints: QueryConstraint[];
  private queryConstraints: QueryConstraint[];
  private sortConstraints: QueryConstraint[];

  constructor(
    private navController: NavController, // need to call open(Document) from parent table
    private popoverCtrl: PopoverController,
    private snack: SnackbarService,
  ) { }

  ngOnInit() {
    this.filterConstraints = [];
    this.sortConstraints = [];
    this.queryConstraints = [limit(this.steps)];

    this.defaultSize = this.steps;

    this.dataList.push(this.loadData());
  }

  public loadData(): Promise<QuerySnapshot<FirebaseDocInterface>> {
    const countQuery = query(
      this.collRef,
      ...this.filterConstraints,
      ...this.sortConstraints,
    );
    const snapQuery = query(
      countQuery,
      ...this.queryConstraints
    );
    const nextDocuments = getDocs(snapQuery);

    Promise.all([
      nextDocuments,
      this.dataList.length === 0 ? getCountFromServer(countQuery) : null
    ]).then(([nextDocs, countSnap]) => {
      if (countSnap) {
        this.count = countSnap.data().count;
      }
      if (this.infiniteScroll && nextDocs.docs.length < this.steps) {
        this.infiniteScroll.disabled = true;
      }
      this.details = this.getDetails();
    })
    .catch(error => {
      console.error(error);
      this.snack.open(error, "error");
    });

    return nextDocuments;
  }

  public async handleScroll(): Promise<void> {
    this.queryConstraints = [await this.getNextQuery(), limit(this.steps)];

    this.dataList.push(this.loadData());
    this.infiniteScroll?.complete();
    console.log('infinite scroll triggereddd')
  }

  public handleSelect(event: MatSelectChange): void {
    this.steps = event.value;

    this.resetData();

    this.queryConstraints = [limit(this.steps)];
    this.dataList.push(this.loadData());
  }

  public async handlePagination(pageChange: number): Promise<void> {
    this.pageIndex += pageChange;
    this.details = this.getDetails();
    if (this.dataList[this.pageIndex]) return;
    
    this.queryConstraints = [await this.getNextQuery(), limit(this.steps)];
    this.dataList.push(this.loadData());
  }

  public async getNextQuery(): Promise<QueryConstraint> {
    const currentSnapshot = await this.dataList[this.dataList.length - 1];
    const lastDoc = currentSnapshot.docs[currentSnapshot.docs.length - 1];

    return startAfter(lastDoc);
  }

  public getDetails(): string {
    const rangeStart = this.pageIndex * this.steps + 1;
    let rangeEnd = rangeStart + this.steps - 1;
    rangeEnd = rangeEnd > this.count ? this.count : rangeEnd;

    return `${rangeStart} - ${rangeEnd}`;
  }

  public sort(sortFieldName: string, sortDirection: OrderByDirection, nextFieldName: string): [string, OrderByDirection] {
    if (nextFieldName == sortFieldName) {
      sortDirection = (sortDirection == 'asc' ? 'desc' : 'asc');
    }
    else {
      sortDirection = 'desc';
      sortFieldName = nextFieldName;
    }

    this.resetData();

    this.sortConstraints = sortFieldName ? [orderBy(sortFieldName, sortDirection)] : [];
    this.queryConstraints = [limit(this.steps)];

    this.dataList.push(this.loadData());

    return [sortFieldName, sortDirection];
  }

  public async openFilterMenu(fieldName: string, event: Event): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: FilterPopoverComponent,
      event,
      cssClass: 'filter-popover'
    });
    await popover.present();

    const { data, role } = await popover.onDidDismiss();

    if (role === 'clear') this.clearFilter();
    else if (role === 'filter') this.filter(fieldName, data);
  }

  public clearFilter(): void {
    this.resetData();

    this.filterConstraints = [];
    this.queryConstraints = [limit(this.steps)];

    this.dataList.push(this.loadData());
  }

  public filter(fieldName: string, fieldSearch: string | number): void {
    if (!isNaN(fieldSearch as any)) fieldSearch = Number(fieldSearch);

    this.resetData();

    this.filterConstraints = [where(fieldName, "==", fieldSearch)];
    this.queryConstraints = [limit(this.steps)];

    this.dataList.push(this.loadData());
  }

  public resetData() {
    this.dataList = [];
    this.pageIndex = 0;
  }

  public roundUp = (num: number) => Math.ceil(num);
}
