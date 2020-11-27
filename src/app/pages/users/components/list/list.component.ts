// import { ShowModalComponent } from './../show-modal/show-modal.component';
import { Component, OnInit } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
// import { OptionsComponent } from '../options/options.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  public listEmployees = [
    {
      name: 'Tomas Opheim',
      code: '2009',
      phone: '(477) 518-86-38',
      employment: 'Support manager',
      status: 'Administrator',
      salary: 8500,
      createAt: '30 December 2019',
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      contract: '10021216548',
      email: 'opheimtomas@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/male78.jpg'
    },
    {
      name: 'Ingrid Online ng',
      code: '2010',
      phone: '(577) 118-86-38',
      employment: 'Business analyst',
      status: 'User basic',
      salary: 15500,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '100552223548',
      email: 'opheimtomas@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/female11.jpg'
    },
    {
      name: 'Simon Arne Moe',
      code: '2011',
      phone: '(577) 118-86-38',
      employment: 'Support manager',
      status: 'User basic',
      salary: 10500,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '100552223123',
      email: 'simonarne@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/male29.jpg'
    },
    {
      name: 'Jimmy Henderson',
      code: '2012',
      phone: '(577) 358-86-38',
      employment: 'Projet manager',
      status: 'User',
      salary: 11500,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '100552223123',
      email: 'simonarne@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/male24.jpg'
    },
    {
      name: 'Eva W Ramirez',
      code: '2015',
      phone: '(127) 458-56-38',
      employment: 'Software developer',
      status: 'User',
      salary: 15500,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '100552223123',
      email: 'simonarne@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/female69.jpg'
    },
    {
      name: 'Bartolome Aviles',
      code: '2018',
      phone: '(227) 458-56-38',
      employment: 'Software developer',
      status: 'Administrator',
      salary: 17500,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '100552223123',
      email: 'simonarne@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/male95.jpg'
    },
    {
      name: 'Bartolome Aviles',
      code: '2018',
      phone: '(227) 458-56-38',
      employment: 'Software developer',
      status: 'Administrator',
      salary: 17500,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '100552223123',
      email: 'simonarne@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/male42.jpg'
    },
    {
      name: 'Bartolome Aviles',
      code: '2018',
      phone: '(227) 458-56-38',
      employment: 'Software developer',
      status: 'Administrator',
      salary: 17500,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '100552223123',
      email: 'simonarne@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/male45.jpg'
    },
    {
      name: 'Bartolome Aviles',
      code: '2018',
      phone: '(227) 458-56-38',
      employment: 'Software developer',
      status: 'Administrator',
      salary: 17500,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '100552223123',
      email: 'simonarne@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/male12.jpg'
    },
    {
      name: 'Pedro Pablo Sainz',
      code: '2019',
      phone: '(327) 458-56-38',
      employment: 'Assistant',
      status: 'Invited',
      salary: 16200,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '101252223123',
      email: 'pedropablosainz@gmail.com',
      pictureURL: '../../../../../assets/avatar.svg'
    },
    {
      name: 'Pedro Pablo Sainz',
      code: '2019',
      phone: '(327) 458-56-38',
      employment: 'Assistant',
      status: 'Invited',
      salary: 16200,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '101252223123',
      email: 'pedropablosainz@gmail.com',
      pictureURL: '../../../../../assets/avatar.svg'
    },
    {
      name: 'Pedro Pablo Sainz',
      code: '2019',
      phone: '(327) 458-56-38',
      employment: 'Assistant',
      status: 'Invited',
      salary: 16200,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '101252223123',
      email: 'pedropablosainz@gmail.com',
      pictureURL: '../../../../../assets/avatar.svg'
    },
    {
      name: 'Pedro Pablo Sainz',
      code: '2019',
      phone: '(327) 458-56-38',
      employment: 'Assistant',
      status: 'Invited',
      salary: 16200,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '101252223123',
      email: 'pedropablosainz@gmail.com',
      pictureURL: '../../../../../assets/avatar.svg'
    },
    {
      name: 'Pedro Pablo Sainz',
      code: '2019',
      phone: '(327) 458-56-38',
      employment: 'Assistant',
      status: 'Invited',
      salary: 16200,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '101252223123',
      email: 'pedropablosainz@gmail.com',
      pictureURL: '../../../../../assets/avatar.svg'
    },
    {
      name: 'Bartolome Aviles',
      code: '2018',
      phone: '(227) 458-56-38',
      employment: 'Software developer',
      status: 'Administrator',
      salary: 17500,
      userId: '8CTeRUBw3zLsgRvHsFgnQAmLWem2',
      createAt: '30 December 2019',
      contract: '100552223123',
      email: 'simonarne@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/male95.jpg'
    },
  ];
  public filterEmployee: boolean;
  public filterStatus: boolean;
  public filterSalary: boolean;
  constructor(
    private popoverController: PopoverController,
    private modalController: ModalController

  ) { }

  ngOnInit(): void {
  }
  public openOptions = async (ev: any, item) => {
    // console.log(item);
    // ev.preventDefault();
    // const popover = await this.popoverController.create({
    //   component: OptionsComponent,
    //   cssClass: 'my-custom-class',
    //   event: ev,
    //   translucent: true,
    //   componentProps: { data: item }
    // });
    // return await popover.present();
  }
  public openModal = async (event, item) => {
    // const modal = await this.modalController.create({
    //   component: ShowModalComponent,
    //   cssClass: 'showModal-employee',
    //   componentProps: { dataMovil: item }
    // });
    // return await modal.present();
  }
}
