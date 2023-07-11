import { SettingsService } from './../utils/service/settings.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SessionInfo, UserInterface } from '@core/services/session-info/session-info.service';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.scss']
})
export class UserDataComponent implements OnInit {
  public collapse$: Observable<boolean>;
  public userinfo: UserInterface;

  constructor(
    private service: SettingsService,
    private session: SessionInfo,
  ) { }

  ngOnInit(): void {
    this.collapse$ = this.service.collapseMenu$;
    this.userinfo = this.session.getUser();
  }

}
