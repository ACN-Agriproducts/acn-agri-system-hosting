import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-option-business',
  templateUrl: './option-business.component.html',
  styleUrls: ['./option-business.component.scss']
})
export class OptionBusinessComponent implements OnInit {
  companyList: any;

  constructor(
    private store: Storage,
    private navController: NavController
    ) { }

  ngOnInit(): void {
    this.store.get('user').then(val => {
      this.companyList = val.worksAt
    })
  }

  public changeCompany(company) {
    this.store.set('currentCompany', company);
    location.reload();
  }

}
