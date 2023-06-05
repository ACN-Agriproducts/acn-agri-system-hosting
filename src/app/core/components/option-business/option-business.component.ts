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
    this.session.loadNewCompany(company).then(() => {
      location.reload();
    });
  }
}
