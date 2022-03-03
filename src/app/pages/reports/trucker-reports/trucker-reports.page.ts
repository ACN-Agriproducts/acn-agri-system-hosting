import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage';
import { Plant } from '@shared/classes/plant';

@Component({
  selector: 'app-trucker-reports',
  templateUrl: './trucker-reports.page.html',
  styleUrls: ['./trucker-reports.page.scss'],
})
export class TruckerReportsPage implements OnInit {
  public plantList: Plant[];
  public chosenPlants: Plant[];
  public startDate: Date;
  public endDate: Date;

  constructor(
    private db: AngularFirestore,
    private localStorage: Storage
  ) {}

  ngOnInit() {
    this.localStorage.get('currentCompany').then(companyName => {
      Plant.getCollectionReference(this.db, companyName).get().then(result => {
        const tempPlantList: Plant[] = [];

        result.forEach(snap => {
          tempPlantList.push(snap.data());
        });

        this.plantList = tempPlantList;
      });
    });
  }

}
