import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { QuerySnapshot } from '@angular/fire/firestore';
import { MatSelectChange } from '@angular/material/select';
import { NavController } from '@ionic/angular';
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

  @Output() handleChange: EventEmitter<number | Event> = new EventEmitter<number | Event>();

  @ContentChild('headers') headers!: TemplateRef<any>;
  @ContentChild('rows') rows!: TemplateRef<any>;
  @ContentChild('status') status: TemplateRef<any>;

  public steps: Promise<number>;
  public page: number = 0;
  public maxPage: number;
  public ready: boolean = false;

  constructor() { }

  ngOnInit() {
    this.steps = this.setSteps();
  }

  // ngOnChanges() {

  // }

  public async setSteps(): Promise<number> {
    return (await this.dataList[0] as QuerySnapshot).docs.length;
  }

  public emitChange(event: number | Event) {
    if (event === -1 || event === 1) {
      this.page += event;
    }
    console.log(this.page);
    this.handleChange.emit(event);
  }

  public roundUp = (num: number) => Math.ceil(num);
}
