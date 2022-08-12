import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

interface User {
  email: string,
  uid: string, 
  refreshToken: string, 
  name: string,
  worksAt: string[],
  currentPermissions: any
}

@Injectable({
  providedIn: 'root'
})
export class SessionInfoService {
  private company: string;
  private plant: string;
  private user: User;

  constructor(
    private localStorage: Storage
  ) { }
}
