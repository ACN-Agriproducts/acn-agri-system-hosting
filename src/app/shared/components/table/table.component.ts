import { Component, ContentChild, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { CollectionReference, getCountFromServer, getDocs, limit, OrderByDirection, query, QueryConstraint, QuerySnapshot, startAfter } from '@angular/fire/firestore';
import { MatSelectChange } from '@angular/material/select';
import { FirebaseDocInterface } from '@shared/classes/FirebaseDocInterface';
import { Observable } from 'rxjs';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  @ContentChild('headers') headers!: TemplateRef<any>;
  @ContentChild('rows') rows!: TemplateRef<any>;
  @ContentChild('status') status: TemplateRef<any>;

  // @Input() dataList!: (Promise<QuerySnapshot<FirebaseDocInterface>> | Observable<QuerySnapshot<FirebaseDocInterface>>)[];
  // @Input() dataCount!: number;
  // @Input() rowAction?: Function;
  // @Input() displayFormat?: string;
  // @Output() tableChange: EventEmitter<number | Event | MatSelectChange> = new EventEmitter<number | Event | MatSelectChange>();
  // public pageDetails: Promise<string>;
  // public pageIndex: number;
  // public steps: Promise<number>;

  // NEW STUFF -----------------------

  @Input() private collRef!: CollectionReference<FirebaseDocInterface>;
  @Input() public displayFormat!: string;
  @Input() public rowAction?: Function = () => {};
  @Input() public steps!: number;

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public count: number = 0;
  public dataList: Promise<QuerySnapshot<FirebaseDocInterface>>[] = [];
  public pageIndex: number = 0;
  public ready: boolean = false;
  public pageDetails: string;
  
  private queryConstraints: QueryConstraint[];
  private sortConstraints: QueryConstraint[];

  // NEW STUFF -----------------------

  constructor(
    private navController: NavController, // need to call open(Document) from parent table
    private snack: SnackbarService,
  ) { }

  // ngOnInit() {
  //   if (this.displayFormat === 'pagination') {
  //     this.steps = this.setSteps();
  //     this.pageDetails = this.getDetails();
  //     this.pageIndex = 0;
  //   }
  // }

  // ngOnChanges() {
  //   if (this.displayFormat === 'pagination') {
  //     this.steps = this.setSteps();
  //     this.pageDetails = this.getDetails();
  //     this.pageIndex = 0;
  //   }
  // }
  
  // public handleScrollChange(event: Event) {
  //   this.tableChange.emit(event);
  // }
  
  // public handlePageChange(event: number | MatSelectChange) {
  //   if (typeof event === 'number') this.pageIndex = event;
  //   this.pageDetails = this.getDetails();
  //   this.tableChange.emit(event);
  // }
  
  // public async setSteps(): Promise<number> {
  //   return (await this.dataList[0] as QuerySnapshot).docs.length;
  // }

  public roundUp = (num: number) => Math.ceil(num);
  
  // public async getDetails(): Promise<string> {
  //   const steps = await this.steps ?? 0;
  //   const range = this.pageIndex * steps;
  //   return `${range + 1} - ${range + steps > this.count ? this.count : range + steps}`;
  // }





  // NEW STUFF -----------------------

  ngOnInit() {
    // initialize sort and query constraints
    this.sortConstraints = [];
    this.queryConstraints = [limit(this.steps)];

    // initialize dataList
    this.dataList.push(this.loadData());

    // initialize other stuff
    getCountFromServer(this.collRef).then(snap => {
      this.count = snap.data().count;
      this.pageDetails = this.getDetails();
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
    // reset dataList, change steps, adjust query, push new data, and reset pageIndex
    this.dataList = [];
    this.steps = event.value;
    this.queryConstraints = [limit(this.steps)];
    this.pageIndex = 0;
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

    // return lastDoc ? startAfter(lastDoc) : null;
    return startAfter(lastDoc);
  }

  public getDetails(): string {
    const range = this.pageIndex * this.steps;
    return `${range + 1} - ${range + this.steps > this.count ? this.count : range + this.steps}`;
  }

  // NEW STUFF -----------------------
}
