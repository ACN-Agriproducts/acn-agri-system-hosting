import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CollectionReference } from '@angular/fire/firestore';

@Component({
  selector: 'app-table-testing',
  templateUrl: './table-testing.component.html',
  styleUrls: ['./table-testing.component.scss'],
})
export class TableTestingComponent implements OnInit {
  @Input() collRef!: CollectionReference;
  @Input() columns!: string[];

  @Input() infiniteScroll?: boolean = false;
  @Input() snapshot?: boolean = false;

  @ViewChild('clientName') clientName: TemplateRef<any>;
  @ViewChild('currentDelivered') currentDelivered: TemplateRef<any>;
  @ViewChild('date') date: TemplateRef<any>;
  @ViewChild('delivery_dates') delivery_dates: TemplateRef<any>;
  @ViewChild('grade') grade: TemplateRef<any>;
  @ViewChild('id') id: TemplateRef<any>;
  @ViewChild('loads') loads: TemplateRef<any>;
  @ViewChild('pricePerBushel') pricePerBushel: TemplateRef<any>;
  @ViewChild('product') product: TemplateRef<any>;
  @ViewChild('quantity') quantity: TemplateRef<any>;
  @ViewChild('status') status: TemplateRef<any>;
  @ViewChild('transport') transport: TemplateRef<any>;


  public ready: boolean = false;

  testData = [
    { 
      clientName: "Tony Daniels",
      currentDelivered: "today",
      date: new Date(),
      delivery_dates: new Date(),
      grade: "A",
      id: "Abc124",
      loads: "Some stuff",
      pricePerBushel: 25.423,
      product: "Yellow Corn",
      quantity: 54,
      status: "active",
      transport: "Truck"
    },
  ];

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.ready = true;
    }, 2000);
  }

  public fieldTemplate = (field: string): TemplateRef<any> => this[field];

  public queryFn() {
    // console.log("change query")
  }

  public action() {
    // console.log("open contract")
  }
}
