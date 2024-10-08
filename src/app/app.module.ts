import { CoreModule } from './core/core.module';
import { SharedModule } from '@shared/shared.module';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutComponent } from '@layout/layout.component';
import { environment } from '@enviroment/environment';
import { IonicStorageModule } from '@ionic/storage';

import { MomentDateModule } from '@angular/material-moment-adapter';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectFirestoreEmulator, enableIndexedDbPersistence, provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage, connectStorageEmulator } from '@angular/fire/storage';
import { provideAuth, connectAuthEmulator, getAuth } from '@angular/fire/auth';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { registerLocaleData } from '@angular/common';
import localeMx from '@angular/common/locales/es-MX';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from './transloco-root.module';
import { CompanyService } from '@core/services/company/company.service';
registerLocaleData(localeMx)


@NgModule({
    declarations: [AppComponent, LayoutComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot({
            mode: 'md'
        }),
        AppRoutingModule,
        BrowserAnimationsModule,
        SharedModule,
        CoreModule,
        provideAuth(() => {
            const auth = getAuth();
            if (!environment.production) {
                connectAuthEmulator(auth, 'http://localhost:9099')
            }
            return auth;
        }),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideFirestore(() => {
            const firestore = getFirestore();
            if(!environment.production) {
                connectFirestoreEmulator(firestore, 'localhost', 8080);
            }
            enableIndexedDbPersistence(firestore);
            return firestore;
        }),
        provideStorage(() => {
            const storage = getStorage();
            if(!environment.production) {
                connectStorageEmulator(storage, 'localhost', 9199)
            }
            return storage;
        }),
        provideFunctions(() => {
            const functions = getFunctions();
            if(!environment.production) {
                connectFunctionsEmulator(functions, 'localhost', 5001)
            }
            return functions;
        }),
        IonicStorageModule.forRoot({
            name: 'dbAgriproductos',
        }),
        MomentDateModule,
        HttpClientModule,
        TranslocoRootModule,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        SessionInfo,
        CompanyService,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        {
            provide: APP_INITIALIZER,
            useFactory: (session: SessionInfo, company: CompanyService) => { 
                return () => Promise.all([session.load(), company.initialize()])
            },
            multi: true,
            deps: [SessionInfo, CompanyService]
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
