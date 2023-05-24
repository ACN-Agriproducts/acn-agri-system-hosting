import { Component, OnInit } from '@angular/core';
import { doc, Firestore, getDoc, getDocs, limit, query } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Plant } from '@shared/classes/plant';

@Component({
  selector: 'app-option-business',
  templateUrl: './option-business.component.html',
  styleUrls: ['./option-business.component.scss']
})
export class OptionBusinessComponent implements OnInit {
  companyList: any;

  constructor(
    private session: SessionInfo,
    private db: Firestore,
    ) { }

  ngOnInit(): void {
    this.companyList = this.session.getUser().worksAt;
  }

  public changeCompany(company) {
    this.session.set('currentCompany', company);
    const user = this.session.getUser();
    const promises = [];
    let tempPromise;
   
    tempPromise = getDoc(doc(this.db, `users/${user.uid}/companies/${company}`)).then(compDoc => {
      user.currentPermissions = compDoc.get('permissions');
      return this.session.set('user', user);
    });
    promises.push(tempPromise);

    tempPromise = getDocs(query(Plant.getCollectionReference(this.db, company), limit(1))).then(plant => {
      return this.session.set('currentPlant', plant.docs[0].id); 
    });
    promises.push(tempPromise);

    Promise.all(promises).then(() => {
      location.reload();
    });
  }
}
