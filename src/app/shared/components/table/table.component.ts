import { Component, ContentChild, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { CollectionReference, getCountFromServer, getDocs, limit, OrderByDirection, query, QueryConstraint, QuerySnapshot, startAfter } from '@angular/fire/firestore';
import { MatSelectChange } from '@angular/material/select';
import { FirebaseDocInterface } from '@shared/classes/FirebaseDocInterface';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { orderBy } from 'firebase/firestore';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  @ContentChild('headers') headers!: TemplateRef<any>;
  @ContentChild('rows') rows!: TemplateRef<any>;
  @ContentChild('status') status: TemplateRef<any>;

  @Input() private collRef!: CollectionReference<FirebaseDocInterface>;
  @Input() public displayFormat!: string;
  @Input() public rowAction?: Function = () => {};
  @Input() public steps!: number;

  @ViewChild(IonInfiniteScroll) private infiniteScroll: IonInfiniteScroll;

  public count: number = 0;
  public dataList: Promise<QuerySnapshot<FirebaseDocInterface>>[] = [];
  public pageIndex: number = 0;
  public ready: boolean = false;
  
  private queryConstraints: QueryConstraint[];
  private sortConstraints: QueryConstraint[];

  constructor(
    private navController: NavController, // need to call open(Document) from parent table
    private snack: SnackbarService,
  ) { }

  ngOnInit() {
    // initialize sort and query constraints
    this.sortConstraints = [];
    this.queryConstraints = [limit(this.steps)];

    // initialize dataList
    this.dataList.push(this.loadData());

    // initialize other stuff
    getCountFromServer(this.collRef).then(snap => {
      this.count = snap.data().count;
    });
  }

  // get dataList for initial and subsequent page/scroll loading
  public loadData(): Promise<QuerySnapshot<FirebaseDocInterface>> {
    const snapQuery = query(
      this.collRef, 
      ...this.sortConstraints, 
      ...this.queryConstraints
    );
    const nextDocuments = getDocs(snapQuery);

    nextDocuments.then(res => {
      // console.log(res.docs.map(doc => doc.data()))
      if (res.docs.length < this.steps && this.infiniteScroll) {
        this.infiniteScroll.disabled = true;
      }
    })
    .catch(error => {
      console.error(error);
      this.snack.open(error, 'error');
    });

    return nextDocuments;
  }

  public async handleScroll(): Promise<void> {
    // change the queryConstraints to startafter last document
    this.queryConstraints = [await this.getNextQuery(), limit(this.steps)];
    // push more dataList into the list
    this.dataList.push(this.loadData());
    // complete infiniteScroll
    this.infiniteScroll?.complete();
  }

  public handleSelect(event: MatSelectChange): void {
    // change steps
    this.steps = event.value;
    // reset dataList and pageIndex
    this.dataList = [];
    this.pageIndex = 0;
    // adjust query for new pageSize, and push new data
    this.queryConstraints = [limit(this.steps)];
    this.dataList.push(this.loadData());
  }

  public async handlePagination(pageChange: number): Promise<void> {
    this.pageIndex += pageChange;
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

  public sort(fieldName: string, direction: OrderByDirection): void {
    // reset dataList and pageIndex
    this.dataList = [];
    this.pageIndex = 0;

    // set constraints to new values
    this.sortConstraints = fieldName ? [orderBy(fieldName, direction)] : [];
    this.queryConstraints = [limit(this.steps)];

    // push new data
    this.dataList.push(this.loadData());
  }

  public roundUp = (num: number) => Math.ceil(num);
}
