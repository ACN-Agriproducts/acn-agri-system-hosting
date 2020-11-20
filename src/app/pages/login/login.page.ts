import { LoginService } from './utils/services/login.service';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class LoginPage implements OnInit, OnDestroy {
  public destroy: boolean;
  public formulario: FormGroup;
  constructor(
    private cd: ChangeDetectorRef,
    private navController: NavController,
    private loadingController: LoadingController,
    private service: LoginService,
    private formBuilder: FormBuilder,
    public alertController: AlertController
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
  }
  public submit = (event: any): void => {
    event.preventDefault();
    if (this.formulario.valid) {
      this.load();
      const email = this.formulario.value.email;
      const password = this.formulario.value.password;
      this.service.login(email, password).then(response => {
        console.log(response);
        if (response) {
          this.loadingController.dismiss().then(() => {
            this.navController.navigateForward('/dashboard/home');
          });
        }
      }).catch((error) => {
        this.presentAlert(error.message);
        this.loadingController.dismiss();
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

    await alert.present();
  }
}
