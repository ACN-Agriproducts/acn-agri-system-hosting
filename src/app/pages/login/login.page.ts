import { LoadingController, NavController } from '@ionic/angular';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class LoginPage implements OnInit, OnDestroy {

  constructor(
    private cd: ChangeDetectorRef,
    private navController: NavController,
    public loadingController: LoadingController
  ) { }

  ngOnDestroy(): void {
    this.cd.markForCheck();
  }

  ngOnInit() {
    this.cd.markForCheck();
  }

  public login = async () => {

    const loading = await this.loadingController.create({
      cssClass: 'panel-load',
      message: 'Please wait...',
      duration: 1000,
      backdropDismiss: true
    });
    setTimeout(() => {
      this.navController.navigateForward('/dashboard/home');
    }, 1000);
    return await loading.present();
    // await loading.onDidDismiss().then(res => {
    // });


  }
}
