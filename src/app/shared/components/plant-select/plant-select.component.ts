import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Plant } from '@shared/classes/plant';

@Component({
  selector: 'app-plant-select',
  templateUrl: './plant-select.component.html',
  styleUrls: ['./plant-select.component.scss'],
})
export class PlantSelectComponent implements OnInit {
  public currentPlant: string;
  public plantListPromise: Promise<Plant[]>;
  public isMenuOpen: boolean;

  constructor(
    public session: SessionInfo,
    private db: Firestore
  ) { }

  ngOnInit() {
    this.currentPlant = this.session.getPlant();
    this.plantListPromise = Plant.getPlantList(this.db, this.session.getCompany());
    this.isMenuOpen = false;
  }

  setPlant(newPlant: string) {
    this.session.set('currentPlant', newPlant);
    this.currentPlant = newPlant;
  }
}
