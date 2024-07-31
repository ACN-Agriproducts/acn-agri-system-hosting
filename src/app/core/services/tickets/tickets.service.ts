import { Injectable } from '@angular/core';
import { getDoc, orderBy, query, where, collection, CollectionReference, OrderByDirection, QueryConstraint, limit, startAfter, getDocs } from '@angular/fire/firestore';
import { Contract } from '@shared/classes/contract';
import { Plant } from '@shared/classes/plant';
import { Ticket, TicketType } from '@shared/classes/ticket';
import { Observable } from 'rxjs';
import { CompanyService } from '../company/company.service';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  constructor(
    private company: CompanyService,
  ) { }

  public getCollectionReference(plant: Plant = this.company.getCurrentPlant()): CollectionReference<Ticket> {
    return collection(this.company.getCurrentPlant().ref, 'tickets').withConverter(Ticket.converter);
  }

  public getTicketsByContract(Contract: Contract): Promise<Ticket[]> {
    return Promise.all(
      Contract.tickets.map(
        ticketRef => getDoc(ticketRef).then(doc => doc.data())
      )
    );
  }

  public async getList(
    type: TicketType, 
    count: number, 
    orderField: string = 'dateOut', 
    sortOrder: OrderByDirection = 'desc',
    startAfterObject?: Ticket): Promise<Ticket[]> {

    const constraints: QueryConstraint[] = [
      where('in', '==', type == 'in'),
      orderBy(orderField, sortOrder),
      limit(count),
    ]

    constraints.push(startAfter(startAfterObject.ref));

    const list = await getDocs(
      query(
        this.getCollectionReference(),
        ...constraints
      )
    );

    return list.docs.map(doc => doc.data());
  }

  public async getActiveTickets(plant?: Plant): Promise<Ticket[]> {
    const list = await getDocs(query(
      this.getCollectionReference(plant),
      where('status', '==', 'active')
    ));

    return list.docs.map(doc => doc.data());
  }
}
