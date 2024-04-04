import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IsScaleGuard implements CanActivate {
  constructor(private session: SessionInfo, private router: Router) {};

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot,): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(this.session.getPermissions()?.isScale && state.url != '/ticket-console') return this.router.parseUrl('/ticket-console');
    if(!this.session.getPermissions()?.isScale && state.url == '/ticket-console') return this.router.parseUrl('/dashboard');
    return true;
  }
  
}
