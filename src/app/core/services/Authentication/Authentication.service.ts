import { Injectable } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(public auth: Auth) {}

  public login = (email: string, password: string) => {
    return signInWithEmailAndPassword(this.auth, email, password)
  }
  public logout = (): void => {
    signOut(this.auth);
  }

  public registerNewUser = (dataUser: any) => {
    return createUserWithEmailAndPassword(this.auth, dataUser.email, dataUser.password)
  }
  // public user = () => {
  //   return this.auth.user;
  // }
}
