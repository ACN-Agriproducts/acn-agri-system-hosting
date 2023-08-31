import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { TranslocoService } from '@ngneat/transloco';
import { Contract } from '@shared/classes/contract';
import { DiscountTables } from '@shared/classes/discount-tables';
import { Liquidation, LiquidationTotals, ReportTicket } from '@shared/classes/liquidation';
import { UNIT_LIST, units } from '@shared/classes/mass';
import { Ticket } from '@shared/classes/ticket';
import { SelectedTicketsPipe } from '@shared/pipes/selectedTickets/selected-tickets.pipe';

import * as Excel from 'exceljs';
import { lastValueFrom } from 'rxjs';
import { LiquidationDialogComponent } from 'src/app/modules/liquidation-printables/liquidation-dialog/liquidation-dialog.component';

@Component({
  selector: 'app-set-liquidation',
  templateUrl: './set-liquidation.page.html',
  styleUrls: ['./set-liquidation.page.scss'],
})
export class SetLiquidationPage implements OnInit {
  @ViewChild('printableDialog') printableDialog: TemplateRef<any>;

  public contract: Contract;
  public discountTables: DiscountTables;
  public id: string;
  public type: string;
  public ready: boolean = false;
  public liquidation: Liquidation;
  public totals: LiquidationTotals = new LiquidationTotals();
  public editingRefId: string;
  public allSelected: boolean = false;

  public editingTickets: ReportTicket[];
  public tickets: ReportTicket[] = [];
  public selectedTickets: ReportTicket[] = [];

  public displayUnits: Map<string, units> = new Map<string, units>([
    ["weight", "lbs"],
    ["moisture", "CWT"],
    ["dryWeight", "CWT"],
    ["damagedGrain", "CWT"],
    ["adjustedWeight", "lbs"],
    ["price", "bu"],
  ]);

  readonly units = UNIT_LIST;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private route: ActivatedRoute,
    private selectedTicketsPipe: SelectedTicketsPipe,
    private transloco: TranslocoService,
    private snack: SnackbarService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.type = this.route.snapshot.paramMap.get('type');
    this.id = this.route.snapshot.paramMap.get('id');
    this.editingRefId = this.route.snapshot.paramMap.get('refId');
  }

  ngOnInit() {
    Contract.getDocById(this.db, this.session.getCompany(), this.type, this.id).then(async contract => {
      this.contract = contract;
      this.discountTables = await DiscountTables.getDiscountTables(this.db, this.session.getCompany(), contract.product.id);

      if ((this.discountTables?.tables.length ?? 0) <= 0) {
        this.snack.open("Warning: No Discount Tables Were Found", "warn");
      }

      this.tickets = (await contract.getTickets()).map(ticket => {
        ticket.getWeightDiscounts(this.discountTables);
        ticket.defineBushels(contract.productInfo);
        return {
          data: Liquidation.getTicketInfo(ticket),
          inReport: false
        }
      });

      if (this.editingRefId) {
        this.liquidation = await contract.getLiquidationByRefId(this.editingRefId);
        const editingTicketIds = this.liquidation.ticketRefs.map(t => t.id);
        this.editingTickets = this.tickets.filter(t => t.inReport = editingTicketIds.includes(t.data.ref.id));
        this.selectedTicketsChange();
      }
      else {
        this.liquidation = new Liquidation(doc(Liquidation.getCollectionReference(this.db, this.session.getCompany(), this.id)));
      }
  
      this.ready = true;
    });
  }

  ngOnDestroy() {
    delete this.totals;
    delete this.liquidation;
  }

  public selectAllTickets(select: boolean): void {
    this.tickets.forEach(t => {
      if (t.data.status !== "pending" || this.editingTickets?.includes(t)) t.inReport = select;
    });
    this.selectedTicketsChange();
  }

  public selectedTicketsChange(): void {
    this.selectedTickets = this.selectedTicketsPipe.transform(this.tickets);
    this.totals = new LiquidationTotals(this.selectedTickets, this.contract);
    this.allSelected = this.selectedTickets.length === this.tickets.filter(t => t.data.status !== "pending" || this.editingTickets?.includes(t)).length;
  }

  public async submit(): Promise<void> {
    await this.openLiquidation();

    this.liquidation.ticketRefs = this.selectedTickets.map(ticket => ticket.data.ref.withConverter(Ticket.converter));
    this.liquidation.set().then(() => {
      this.tickets.forEach(ticket => {
        updateDoc(ticket.data.ref, {
          weightDiscounts: ticket.data.weightDiscounts.getRawData()
        });
      });
      this.snack.open(`Liquidation successfully ${this.editingRefId ? "edited" : "created"}`, "success");
      this.router.navigate([`dashboard/contracts/contract-info/${this.type}/${this.id}`]);
    })
    .catch(e => {
      console.error(e);
      this.snack.open(`Error ${this.editingRefId ? "editing" : "creating"} liquidation`, "success");
    });
  }

  public async openLiquidation(): Promise<void> {
    const dialog = this.dialog.open(LiquidationDialogComponent, {
      data: {
        selectedTickets: this.selectedTickets,
        contract: this.contract,
        totals: this.totals,
        displayUnits: this.displayUnits,
      },
      panelClass: "borderless-dialog",
      minWidth: "80%",
      maxWidth: "100%",
      height: "75vh"
    });
    return lastValueFrom(dialog.afterClosed());
  }
}
