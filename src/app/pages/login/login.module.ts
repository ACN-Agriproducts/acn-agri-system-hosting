import { LoginService } from './utils/services/login.service';
import { CoreModule } from '@core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';
import { AngularFirestoreModule } from '@angular/fire/firestore';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
    CoreModule,
    ReactiveFormsModule,
    AngularFirestoreModule
  ],
  declarations: [LoginPage],
  providers: [
    LoginService
  ]
})
export class LoginPageModule {}
