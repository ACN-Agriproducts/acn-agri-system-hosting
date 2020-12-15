import { CoreModule } from './core/core.module';
import { SharedModule } from '@shared/shared.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutComponent } from '@layout/layout.component';
import { AngularFireModule } from '@angular/fire';
import { environment } from '@enviroment/environment.prod';
import { IonicStorageModule } from '@ionic/storage';
import { File } from '@ionic-native/file/ngx';


@NgModule({
  declarations: [AppComponent, LayoutComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'md'
    }),
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    CoreModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    IonicStorageModule.forRoot({
      name: 'dbAgriproductos',
    })
  ],
  providers: [
    StatusBar,
    
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
