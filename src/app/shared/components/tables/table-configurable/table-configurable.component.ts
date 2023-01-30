import { Component, ContentChild, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CollectionReference, getCountFromServer, getDocs, limit, OrderByDirection, query, QueryConstraint, QuerySnapshot, startAfter, where } from '@angular/fire/firestore';
import { MatSelectChange } from '@angular/material/select';
import { FirebaseDocInterface } from '@shared/classes/FirebaseDocInterface';
import { NavController, PopoverController } from '@ionic/angular';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { orderBy, QueryDocumentSnapshot } from 'firebase/firestore';
import { FilterPopoverComponent } from '../filter-popover/filter-popover.component';

declare type TableType = "" | "infiniteScroll" | "pagination";

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
  @Input() public displayOptions!: DisplayOptions;
  @Input() public rowAction?: (document: QueryDocumentSnapshot<FirebaseDocInterface>) => void = () => {};
  @Input() public steps!: number;

  @ViewChild('tableWrapper') public tableWrapper: ElementRef<HTMLElement>;
  @ViewChild('table') public table: ElementRef<HTMLElement>;

  public count: number;
  public dataList: Promise<QuerySnapshot<FirebaseDocInterface>>[] = [];
  public pageIndex: number = 0;
  public defaultSize: number;
  public details: string;
  public disableInfiniteScroll: boolean = false;
  public tableWrapperHeight: number;
  
  private filterConstraints: QueryConstraint[];
  private queryConstraints: QueryConstraint[];
  private sortConstraints: QueryConstraint[];

  constructor(
    private navController: NavController, // need to call open(Document) from parent table
    private popoverCtrl: PopoverController,
    private snack: SnackbarService,
  ) { }

  ngOnInit() {
    // following statement needed due to ion infinite scroll bug
    if (this.displayOptions.tableType === 'infiniteScroll' && (this.steps ?? 10) < 10) {
      console.warn("Minimum steps of 10 necessary for infiniteScroll");
      this.steps = 10;
    }

    this.filterConstraints = [];
    this.sortConstraints = [];
    this.queryConstraints = [limit(this.steps)];

    this.defaultSize = this.steps;
    
    this.loadData().then(async () => {
      this.tableWrapperHeight ||= this.tableWrapper.nativeElement.scrollHeight;
      while (this.table.nativeElement.scrollHeight < this.tableWrapperHeight - 100) {
        await this.handleScroll();
      }
    });
  }

  public async loadData(): Promise<QuerySnapshot<FirebaseDocInterface>> {
    const countQuery = query(
      this.collRef,
      ...this.filterConstraints,
      ...this.sortConstraints,
    );
    const snapQuery = query(
      countQuery,
      ...this.queryConstraints
    );
    
    const nextDocsPromise = getDocs(snapQuery);
    this.dataList.push(nextDocsPromise);

    this.count ??= (await getCountFromServer(countQuery)).data().count;
    this.details = this.getDetails();

    return nextDocsPromise;
  }

  public async handleScroll(event?: any): Promise<void> {
    this.queryConstraints = [await this.getNextQuery(), limit(this.steps)];
    const nextDocs = await this.loadData();

    this.disableInfiniteScroll = nextDocs.docs.length < this.steps;
    event?.target.complete();
  }

  public handleSelect(event: MatSelectChange): void {
    this.steps = event.value;

    this.resetData();
    this.queryConstraints = [limit(this.steps)];

    this.loadData();
  }

  public async handlePagination(pageChange: number): Promise<void> {
    this.pageIndex += pageChange;
    this.details = this.getDetails();

    if (this.dataList[this.pageIndex]) return;
    this.queryConstraints = [await this.getNextQuery(), limit(this.steps)];

    this.loadData();
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

    this.loadData();

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

    this.loadData();
  }

  public filter(fieldName: string, fieldSearch: string | number): void {
    if (!isNaN(fieldSearch as any)) fieldSearch = Number(fieldSearch);

    this.resetData();
    this.filterConstraints = [where(fieldName, "==", fieldSearch)];
    this.queryConstraints = [limit(this.steps)];

    this.loadData();
  }

  public resetData() {
    this.dataList = [];
    this.pageIndex = 0;
  }

  public roundUp = (num: number) => Math.ceil(num);
}

export interface DisplayOptions {
  tableType: TableType;
  fixed: boolean;
  defaultDateFormat?: string;
  dateFormat?: string;
  deliveryDatesFormat?: string;
}
