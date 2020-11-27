import { SettingsService } from './../utils/service/settings.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.scss']
})
export class UserDataComponent implements OnInit {
  public collapse$: Observable<boolean>;
  constructor(
    private service: SettingsService
  ) { }

  ngOnInit(): void {
    this.collapse$ = this.service.collapseMenu$;
  }

}
