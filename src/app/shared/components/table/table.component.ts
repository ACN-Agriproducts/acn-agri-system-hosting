import { Component, ContentChild, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { CollectionReference, getDocs, limit, OrderByDirection, query, QueryConstraint, QuerySnapshot } from '@angular/fire/firestore';
import { MatSelectChange } from '@angular/material/select';
import { FirebaseDocInterface } from '@shared/classes/FirebaseDocInterface';
import { Observable } from 'rxjs';
import { NavController } from '@ionic/angular';
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

  @Input() rowAction?: Function;
  @Input() displayFormat?: string;
  @Input() collRef!: CollectionReference<FirebaseDocInterface>;
  @Input() steps: number;

  public data: Promise<QuerySnapshot<FirebaseDocInterface>>[] = [];
  public pageIndex: number = 0;
  public ready: boolean = false;
  public count: number = 0;
  
  public queryConstraints: QueryConstraint[];
  public sortConstraints: QueryConstraint[];
  public sortDirection: OrderByDirection;
  public sortFieldName: string;

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

  // public roundUp = (num: number) => Math.ceil(num);
  
  // public async getDetails(): Promise<string> {
  //   const steps = await this.steps ?? 0;
  //   const range = this.pageIndex * steps;
  //   return `${range + 1} - ${range + steps > this.dataCount ? this.dataCount : range + steps}`;
  // }





  // NEW STUFF -----------------------

  ngOnInit() {
    // initialize sort and query constraints
    this.sortConstraints = [];
    this.queryConstraints = this.steps ? [limit(this.steps)] : [];

    // initialize data
    this.data.push(this.loadData());
  }

  // get data for initial and subsequent page/scroll loading
  public loadData(): Promise<QuerySnapshot<FirebaseDocInterface>> {
    const docQuery = query(
      this.collRef, 
      ...this.sortConstraints, 
      ...this.queryConstraints
    );

    const nextDocuments = getDocs(docQuery);
    nextDocuments.then(res => {
      console.log(res.docs.map(doc => doc.data()))
      
      if (res.docs.length < this.steps) {
        console.log("end infiniteScroll");
      }
    })
    .catch(error => {
      console.error(error);
      this.snack.open(error, 'error');
    });

    return nextDocuments;
  }

  // NEW STUFF -----------------------
}
