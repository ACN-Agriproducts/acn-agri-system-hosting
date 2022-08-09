import { DataUser } from './../../models/DataUser';
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
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
    this.auth.signOut();
  }

  public registerNewUser = (dataUser: DataUser) => {
    return createUserWithEmailAndPassword(this.auth, dataUser.email, dataUser.password)
  }
  // public user = () => {
  //   return this.auth.user;
  // }
}
