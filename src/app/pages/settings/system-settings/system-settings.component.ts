import { TranslocoService } from '@ngneat/transloco';
import { SettingsService } from './../utils/service/settings.service';
import { Component, OnInit } from '@angular/core';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { User } from '@shared/classes/user';
import { Firestore, updateDoc } from '@angular/fire/firestore';


@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss']
})
export class SystemSettingsComponent implements OnInit {
  public collapse = false;
  public displayName = true;
  public type: boolean;
  public language: string;

  constructor(
    private service: SettingsService,
    private transloco: TranslocoService,
    private session: SessionInfo,
    private db: Firestore
  ) { }

  ngOnInit(): void {
    this.language = this.transloco.getActiveLang();
  }
  public collapseMenu = (event) => {
    this.service.collapseMenu.next(event.detail.checked);
  }
  public displayNameUser = (event) => {
    this.service.displayName.next(event.detail.checked);  
  }
  public darkMode = (event) => {
    if (event.detail.checked) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  public languageChange() {
    this.transloco.setActiveLang(this.language);
    this.transloco.setDefaultLang(this.language);
    this.session.set('defaultLanguage', this.language);

    const userRef = User.getDocumentReference(this.db, this.session.getUser().uid);
    updateDoc(userRef.withConverter(null), {
      language: this.language,
    });
  }

}
