import { ModalController, NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { NewUserComponent } from './components/new-user/new-user.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  public border: boolean;
  constructor(
    private modalController: ModalController,
    private navController: NavController
  ) { }

  ngOnInit() {
  }

  public logScroll= (event) => {
    const scrolling = event.detail.scrollTop;
    if (scrolling > 0) {
      this.border = true;
    } else {
      this.border = false;
    }
  }
  public openNewUser = () => {
    // const modal = await this.modalController.create({
    //   component: NewUserComponent,
    //   cssClass: 'moda-general-lg'
    // });
    this.navController.navigateForward('dashboard/users/new-user');
    // await modal.present();
  }
}
