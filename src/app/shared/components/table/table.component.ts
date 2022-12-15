import { Component, ContentChild, Input, OnInit, Output, TemplateRef } from '@angular/core';
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
  @Input() ready?: boolean;
  @Input() rowAction?: any;

  @ContentChild('headers') headers!: TemplateRef<any>;
  @ContentChild('rows') rows!: TemplateRef<any>;
  @ContentChild('status') status: TemplateRef<any>;

  constructor(
    private navController: NavController
  ) { }

  ngOnInit() {
  }
}
