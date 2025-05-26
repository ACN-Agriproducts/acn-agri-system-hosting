import { Injectable, OnDestroy } from '@angular/core';
import { getDoc, orderBy, query, where, collection, CollectionReference, OrderByDirection, QueryConstraint, limit, startAfter, getDocs, Unsubscribe, collectionData } from '@angular/fire/firestore';
import { Contract } from '@shared/classes/contract';
import { Plant } from '@shared/classes/plant';
import { Ticket, TicketType } from '@shared/classes/ticket';
import { map, Observable } from 'rxjs';
import { CompanyService } from '../company/company.service';

@Injectable({
  providedIn: 'root'
})
export class TicketsService implements OnDestroy{
  public unsubs: Unsubscribe[] = [];

  /**
   * A cache to store commonly queued arrays of tickets.
   */
  public activeTicketCache: {
    [plant: string]: {
      "in": Observable<Ticket[]>,
      "out": Observable<Ticket[]>
    }
  } = {
    "progreso": {
      "in": null,
      "out": null
    }
  };

  constructor(
    private company: CompanyService
  ) {}

  public getCollectionReference(plant: Plant = this.company.getCurrentPlant()): CollectionReference<Ticket> {
    return collection(plant.ref, 'tickets').withConverter(Ticket.converter);
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

  public getActiveTicketsObs(inTicket: boolean, plant: Plant = this.company.getCurrentPlant()): Observable<Ticket[]> {
    this.activeTicketCache[plant.ref.id][inTicket ? "in" : "out"] ??= collectionData(
      query(
        this.getCollectionReference(plant),
        where('status', '==', 'active'),
        where('in', '==', inTicket)
      )
    ).pipe(map(tickets => tickets.sort((a, b) => a.id - b.id)));

    return this.activeTicketCache[plant.ref.id][inTicket ? "in" : "out"];
  }

  ngOnDestroy(): void {
    this.unsubs.forEach(unsub => unsub());
  }
  
}
