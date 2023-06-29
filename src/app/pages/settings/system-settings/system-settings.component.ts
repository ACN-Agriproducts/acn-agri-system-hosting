import { TranslocoService } from '@ngneat/transloco';
import { SettingsService } from './../utils/service/settings.service';
import { Component, OnInit } from '@angular/core';


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
    private transloco: TranslocoService
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
    console.log(this.language);
    this.transloco.setActiveLang(this.language);
  }

}
