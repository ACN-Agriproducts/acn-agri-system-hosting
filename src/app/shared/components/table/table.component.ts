import { Component, ContentChild, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { QuerySnapshot } from '@angular/fire/firestore';
import { MatSelectChange } from '@angular/material/select';
import { FirebaseDocInterface } from '@shared/classes/FirebaseDocInterface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  @Input() dataList!: (Promise<QuerySnapshot<FirebaseDocInterface>> | Observable<QuerySnapshot<FirebaseDocInterface>>)[];
  @Input() dataCount!: number;
  @Input() rowAction?: Function;
  @Input() displayFormat?: string;

  @Output() tableChange: EventEmitter<number | Event | MatSelectChange> = new EventEmitter<number | Event | MatSelectChange>();

  @ContentChild('headers') headers!: TemplateRef<any>;
  @ContentChild('rows') rows!: TemplateRef<any>;
  @ContentChild('status') status: TemplateRef<any>;

  // @ViewChild('tableWrap', {static: false}) tableWrap: Element;

  public pageDetails: Promise<string>;
  public pageIndex: number;
  public steps: Promise<number>;

  constructor() { }

  ngOnInit() {
    if (this.displayFormat === 'pagination') {
      this.steps = this.setSteps();
      this.pageDetails = this.getDetails();
      this.pageIndex = 0;
    }
  }

  ngAfterViewInit() {
    // if (!this.scrollBarExists()) {
    //   console.log("scroll bar does not exist")
    //   this.handleScrollChange();
    // }
  }
  
  // public scrollBarExists(): boolean {
  //   console.log(this.tableWrap.scrollHeight > this.tableWrap.clientHeight)
  //   return this.tableWrap.scrollHeight > this.tableWrap.clientHeight;
  // }

  ngOnChanges() {
    if (this.displayFormat === 'pagination') {
      this.steps = this.setSteps();
      this.pageDetails = this.getDetails();
      this.pageIndex = 0;
    }
  }
  
  public handleScrollChange(event: Event) {
    // console.log(event)
    this.tableChange.emit(event);
  }
  
  public handlePageChange(event: number | MatSelectChange) {
    if (typeof event === 'number') this.pageIndex = event;
    this.pageDetails = this.getDetails();
    this.tableChange.emit(event);
  }
  
  public async setSteps(): Promise<number> {
    return (await this.dataList[0] as QuerySnapshot).docs.length;
  }

  public roundUp = (num: number) => Math.ceil(num);
  
  public async getDetails(): Promise<string> {
    const steps = await this.steps ?? 0;
    const range = this.pageIndex * steps;
    return `${range + 1} - ${range + steps > this.dataCount ? this.dataCount : range + steps}`;
  }
}
