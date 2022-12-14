import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { Plant } from '@shared/classes/plant';
import { DocumentReference, Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
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

  columns = [
    'clientName',
    'currentDelivered',
    'date',
    'delivery_dates',
    'grade',
    'id',
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
  }
}
