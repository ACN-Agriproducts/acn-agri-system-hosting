import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Plant } from '@shared/classes/plant';
import { Ticket } from '@shared/classes/ticket';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-needs-admin-attention',
  templateUrl: './needs-admin-attention.component.html',
  styleUrls: ['./needs-admin-attention.component.scss'],
})
export class NeedsAdminAttentionComponent implements OnInit, OnDestroy {
  @Input() company: string;
  public ticketsList: Ticket[];
  public user: any;
  public ticketSubscription: Subscription;

  constructor(
    private db: Firestore,
    private localStorage: Storage,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.ticketsList = [];

    Plant.getPlantList(this.db, this.company).then(plants => {
      plants.forEach(plant => {
        this.ticketSubscription = Ticket.getTicketSnapshot(this.db, this.company, plant.ref.id, where('voidRequest', '==', true)).subscribe(tickets => {
          this.ticketsList = tickets.sort((a, b) => a.dateOut.getTime() - b.dateOut.getTime());
        }); 
      });
    });
    
    this.localStorage.get('user').then(user => {
      this.user = user;
    })
  }

  voidTicket = async (ticket: Ticket) => {
    let alert = await this.alertController.create({
      header: "Alert",
      message: "Are you sure you want to void this ticket?",
      inputs: [
        {
          name: 'voidReason',
          type: 'textarea',
          placeholder: 'reason',
          value: ticket.voidReason
        }
      ],
      buttons: [
        {
          text: "Cancel",
          role: 'cancel'
        },
        {
          text:"Accept",
          handler: async (data) => {
            alert.dismiss();

            const updateDoc: any = {
              void: true,
              voidRequest: false,
              voidAcceptor: this.user.name
            }

            if(!ticket.voidReason) {
              updateDoc.voidReason = data.voidReason ?? null;
            }

            await ticket.update(updateDoc);
          }
        }]
    })

    alert.present();
  }

  ngOnDestroy(): void {
    this.ticketSubscription.unsubscribe();
  }


}
