import { Component, OnInit } from '@angular/core';
import { Firestore, doc } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contract } from '@shared/classes/contract';

@Component({
  selector: 'app-new-contract',
  templateUrl: './new-contract.page.html',
  styleUrls: ['./new-contract.page.scss'],
})
export class NewContractPage implements OnInit {
  public contract: Contract;
  public focusedFieldName: string;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
  ) { }

  ngOnInit() {
    this.contract = new Contract(
      doc(Contract.getCollectionReference(this.db, this.session.getCompany()))
    )
  }
}
