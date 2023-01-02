import { Component, ContentChild, Input, OnInit, Output, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FirebaseDocInterface } from '@shared/classes/FirebaseDocInterface';
import { QuerySnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  @Input() dataList!: (Promise<QuerySnapshot<FirebaseDocInterface>> | Observable<QuerySnapshot<FirebaseDocInterface>>)[];
  @Input() rowAction?: any;
  @Input() displayFormat?: string;

  @ContentChild('headers') headers!: TemplateRef<any>;
  @ContentChild('rows') rows!: TemplateRef<any>;
  @ContentChild('status') status: TemplateRef<any>;

  constructor(
    private navController: NavController
  ) { }

  ngOnInit() {

  }

  public async infiniteDocs(event) {
    // this.dataList.getNext(snapshot => {
    //   event.target.complete();
    //   this.infiniteScroll.disabled = snapshot.docs.length < this.contractStep;
    // });
  }
}
