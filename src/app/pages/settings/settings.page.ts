import { SettingsService } from './utils/service/settings.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  public collapse$: Observable<boolean>;
  constructor(
    private service: SettingsService
  ) { }

  ngOnInit() {
    this.collapse$ = this.service.collapseMenu$;
  }

}
