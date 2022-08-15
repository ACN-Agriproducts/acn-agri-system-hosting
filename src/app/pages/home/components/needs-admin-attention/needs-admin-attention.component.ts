import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Plant } from '@shared/classes/plant';
import { Ticket } from '@shared/classes/ticket';
import { FixTicketStorageComponent } from '@shared/components/fix-ticket-storage/fix-ticket-storage.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-needs-admin-attention',
  templateUrl: './needs-admin-attention.component.html',
  styleUrls: ['./needs-admin-attention.component.scss'],
})
export class NeedsAdminAttentionComponent implements OnInit, OnDestroy {
  @Input() company: string;
  public voidTicketsList: Ticket[];
  public needsAttentionTicketList: Ticket[];
  public user: any;
  public voidTicketSubscription: Subscription;
  public needsAttentionTicketSubscription: Subscription;

  constructor(
    private db: Firestore,
    private localStorage: Storage,
    private alertController: AlertController,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.voidTicketsList = [];
    this.needsAttentionTicketList = [];

    Plant.getPlantList(this.db, this.company).then(plants => {
      plants.forEach(plant => {
        this.voidTicketSubscription = Ticket.getTicketSnapshot(this.db, this.company, plant.ref.id, where('voidRequest', '==', true)).subscribe(tickets => {
          this.voidTicketsList = tickets.sort((a, b) => a.dateOut.getTime() - b.dateOut.getTime());
        }); 

        this.needsAttentionTicketSubscription = Ticket.getTicketSnapshot(this.db, this.company, plant.ref.id, where('needsAttention', '==', true)).subscribe(tickets => {
          this.needsAttentionTicketList = tickets.filter(t => !t.void).sort((a, b) => a.dateOut.getTime() - b.dateOut.getTime());
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

  async fixTicketModal(ticket: Ticket) {
    this.dialog.open(FixTicketStorageComponent, {
      width: '50%',
      data: ticket
    });
  }

  ngOnDestroy(): void {
    this.voidTicketSubscription.unsubscribe();
    this.needsAttentionTicketSubscription.unsubscribe();
  }
}
