import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { Plant } from '@shared/classes/plant';
import { DocumentReference, Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { ColumnInfo, contractColumns } from '@shared/components/table-contracts/table-contracts.component';

export interface Item {
  createdAt: Date;
  employees: DocumentReference[];
  name: string;
  owner: string;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public permissions: any;
  public currentCompany: string;

  public columns: (contractColumns | ColumnInfo)[] = [
    'id',
    'clientName',
    'currentDelivered',
    // 'date',
    'delivery_dates',
    'grade',
    'loads',
    'pricePerBushel',
    'product',
    'quantity',
    'status',
    'transport',
  ];

  constructor(
    private session: SessionInfo
  ) {
  }

  ngOnInit() {
    this.permissions = this.session.getPermissions();
    this.currentCompany = this.session.getCompany();

    // this.columns = [
    //   { fieldName: 'id' },
    //   { fieldName: 'clientName', width: '200px'},
    //   { fieldName: 'currentDelivered', width: '100px' },
    //   { fieldName: 'date', width: '100px' },
    //   { fieldName: 'delivery_dates', width: '100px' },
    //   { fieldName: 'grade' },
    //   { fieldName: 'loads' },
    //   { fieldName: 'pricePerBushel', width: '100px' },
    //   { fieldName: 'product', width: '100px' },
    //   { fieldName: 'quantity', width: '100px' },
    //   { fieldName: 'status', width: '100px' },
    //   { fieldName: 'transport', width: '100px' },
    // ];
  }
}
