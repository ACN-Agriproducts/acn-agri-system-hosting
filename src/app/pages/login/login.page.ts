import { LoginService } from './utils/services/login.service';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class LoginPage implements OnInit, OnDestroy {
  public destroy: boolean;
  public formulario: FormGroup;

  private currentSubs: Subscription[] = [];
  constructor(
    private cd: ChangeDetectorRef,
    private navController: NavController,
    private loadingController: LoadingController,
    private service: LoginService,
    private formBuilder: FormBuilder,
    public alertController: AlertController,
    private storage: Storage,
    private fb: AngularFirestore,
    private auth: AngularFireAuth
  ) {
    this.buildForm();
  }

  private buildForm = (): void => {
    this.formulario = this.formBuilder.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['', [Validators.required]]
    });
  }
  ngOnDestroy(): void {
    this.cd.markForCheck();

    for(const sub of this.currentSubs) {
      sub.unsubscribe();
    }
  }
  ionViewDidLeave() {
  }
  ngOnInit() {
    this.auth.onAuthStateChanged(async user => {
      console.log(this.fb)
      console.log(user)
      if(user) {
        try{
          const val = (await this.fb.doc(`/users/${user.uid}`).get().toPromise()).data();
          const compDoc = (await this.fb.doc(`/users/${user.uid}/companies/${val['worksAt'][0]}`).get().toPromise()).data();
          this.storage.set('user', {
            email: user.email,
            uid: user.uid, 
            refreshToken: user.refreshToken, 
            name: user.displayName,
            worksAt: val['worksAt'],
            currentPermissions: compDoc["permissions"]
          });
          
          this.storage.set('currentCompany', val['worksAt'][0])

          this.loadingController.dismiss().then((res) => {
            this.navController.navigateForward('/dashboard/home');
          });
          
        }
        catch(error) {
          console.error('Error',error);
          if(user) {
            //this.auth.signOut();
          }
        }
      }
    })
  }
  public submit = (event: any): void => {
    event.preventDefault();
    if (this.formulario.valid) {
      this.load();
      const email = this.formulario.value.email;
      const password = this.formulario.value.password;
      this.service.login(email, password).catch((error) => {
        this.presentAlert(error.message);
      });
    }
  }
  private load = async () => {
    console.log('ss');

    const loading = await this.loadingController.create({
      cssClass: 'panel-load',
      message: 'Please wait...',
      // duration: 1000,
      backdropDismiss: true
    });
    return await loading.present();

  }
  public presentAlert = async (message: string) => {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present().then(() => {
      this.loadingController.dismiss();
    });
  }
  private dataUser = (data) => {
    return {
      displayName: data.displayName,
      email: data.email,
      uid: data.uid,
      photoURL: data.photoURL,
      phoneNumber: data.phoneNumber,
      refreshToke: data.refreshToken
    }
  }
}
