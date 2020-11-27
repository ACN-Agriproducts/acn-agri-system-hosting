import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  /** COLLAPSEMENU */

  public collapseMenu = new BehaviorSubject<boolean>(false);
  public collapseMenu$ = this.collapseMenu.asObservable();

  /** USERDISPLAY */
  public displayName = new BehaviorSubject<boolean>(true);
  public displayName$ = this.displayName.asObservable();


  constructor() { }
}
