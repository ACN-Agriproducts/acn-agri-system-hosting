import { ShowModalComponent } from './../show-modal/show-modal.component';
import { Component, OnInit } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { OptionsComponent } from '../options/options.component';

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
      status: 'test period',
      salary: 8500,
      time: '3 month',
      timeWork: 'Part time',
      contract: '10021216548',
      email: 'opheimtomas@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/male64.jpg'
    },
    {
      name: 'Ingrid Online ng',
      code: '2010',
      phone: '(577) 118-86-38',
      employment: 'Business analyst',
      status: 'worker',
      salary: 15500,
      timeWork: 'Full time',
      time: '3 year',
      contract: '100552223548',
      email: 'opheimtomas@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/female97.jpg'
    },
    {
      name: 'Simon Arne Moe',
      code: '2011',
      phone: '(577) 118-86-38',
      employment: 'Support manager',
      status: 'worker',
      salary: 10500,
      timeWork: 'Full time',
      time: '2 years',
      contract: '100552223123',
      email: 'simonarne@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/male20.jpg'
    },
    {
      name: 'Jimmy Henderson',
      code: '2012',
      phone: '(577) 358-86-38',
      employment: 'Projet manager',
      status: 'worker',
      salary: 11500,
      timeWork: 'Full time',
      time: '2 years',
      contract: '100552223123',
      email: 'simonarne@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/male21.jpg'
    },
    {
      name: 'Eva W Ramirez',
      code: '2015',
      phone: '(127) 458-56-38',
      employment: 'Software developer',
      status: 'worker',
      salary: 15500,
      timeWork: 'Full time',
      time: '1 years',
      contract: '100552223123',
      email: 'simonarne@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/female29.jpg'
    },
    {
      name: 'Bartolome Aviles',
      code: '2018',
      phone: '(227) 458-56-38',
      employment: 'Software developer',
      status: 'worker',
      salary: 17500,
      timeWork: 'Full time',
      time: '1 years',
      contract: '100552223123',
      email: 'simonarne@gmail.com',
      pictureURL: 'https://www.randomaddressgenerator.com/media/face/male22.jpg'
    },
    {
      name: 'Pedro Pablo Sainz',
      code: '2019',
      phone: '(327) 458-56-38',
      employment: 'Software developer',
      status: 'test period',
      salary: 16200,
      timeWork: 'Full time',
      time: '6 months',
      contract: '101252223123',
      email: 'pedropablosainz@gmail.com',
      pictureURL: '../../../../../assets/avatar.svg'
    }
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
    console.log(item);
    ev.preventDefault();
    const popover = await this.popoverController.create({
      component: OptionsComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
      componentProps: { data: item }
    });
    return await popover.present();
  }
  public openModal = async (event, item) => {
    const modal = await this.modalController.create({
      component: ShowModalComponent,
      cssClass: 'showModal-employee',
      componentProps: { dataMovil: item }
    });
    return await modal.present();
  }
}
