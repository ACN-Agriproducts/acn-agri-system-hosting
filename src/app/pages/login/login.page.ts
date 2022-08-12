import { LoginService } from './utils/services/login.service';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { User } from '@shared/classes/user';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Company } from '@shared/classes/company';
import { Plant } from '@shared/classes/plant';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class LoginPage implements OnInit, OnDestroy {
  public destroy: boolean;
  public formulario: UntypedFormGroup;

  constructor(
    private cd: ChangeDetectorRef,
    private navController: NavController,
    private loadingController: LoadingController,
    private service: LoginService,
    private formBuilder: UntypedFormBuilder,
    public alertController: AlertController,
    private db: Firestore,
    private auth: Auth,
    private session: SessionInfo
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
  }
  ionViewDidLeave() {
  }
  ngOnInit() {
    this.auth.onAuthStateChanged(async user => {
      console.log(user);
      if(user) {
        try{
          const val = await User.getUser(this.db, user.uid);
          const compDoc = await val.getPermissions(val.worksAt[0]);

          Company.getCompany(this.db, val.worksAt[0]).then(async company => {
            const plants = await Plant.getPlantList(this.db, company.ref.id);
            this.session.set('currentPlant', plants[0].ref.id);
          });

          this.session.set('user', {
            email: user.email,
            uid: user.uid, 
            refreshToken: user.refreshToken, 
            name: val.name,
            worksAt: val['worksAt'],
            currentPermissions: compDoc
          });
          
          this.session.set('currentCompany', val['worksAt'][0])

          this.navController.navigateForward('/dashboard/home');
          this.loadingController.dismiss();
          
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
