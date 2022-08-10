import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { Plant } from '@shared/classes/plant';
import { DocumentReference, Firestore } from '@angular/fire/firestore';
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
  items: Observable<Item[]>;
  items2: Observable<any>;
  constructor(
    private db: Firestore,
    private localStorage: Storage
  ) {
  }

  ngOnInit() {
    this.localStorage.get("currentPlant").then(currentPlant => {
      if(currentPlant == null) {
        this.setCurrentPlant();
      }
    });
  }

  async setCurrentPlant() {
    const plantList = await Plant.getPlantList(this.db, await this.localStorage.get("currentCompany"));
    await this.localStorage.set("currentPlant", plantList[0].ref.id);
  }

}
