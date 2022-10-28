import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contact } from '@shared/classes/contact';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  public id: string;
  public currentCompany: string;
  public contact: Contact;
  public ready: boolean = false;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();
    this.id = this.route.snapshot.paramMap.get('id');

    Contact.getDoc(this.db, this.currentCompany, this.id).then(result => {
      this.contact = result;
      this.ready = true;
    });
  }

}
