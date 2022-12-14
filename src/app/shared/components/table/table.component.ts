import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  @Input() data!: any[];
  @Input() queryFn?: any;
  @Input() ready?: boolean;
  @Input() rowAction?: any;

  @ContentChild('headers') headers!: TemplateRef<any>;
  @ContentChild('rows') rows!: TemplateRef<any>;
  @ContentChild('status') status: TemplateRef<any>;

  constructor(
    private navController: NavController
  ) { }

  ngOnInit() {
    /* Testing */

    this.queryFn();

    /* Testing */
  }

}
