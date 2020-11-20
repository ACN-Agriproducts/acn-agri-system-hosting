import { AuthenticationService } from '@core/services/Authentication/Authentication.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private authentication: AuthenticationService
  ) { }

  public login = (email: string, password: string) => {
    return this.authentication.login(email, password);
  }
}
