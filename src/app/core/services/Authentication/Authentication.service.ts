import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(public auth: AngularFireAuth) { }

  public login = (email: string, password: string) => {
    return this.auth.signInWithEmailAndPassword(email, password);
  }
  public logout = (): void => {
    this.auth.signOut();
  }
}
