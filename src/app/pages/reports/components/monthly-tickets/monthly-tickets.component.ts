import { Component, createPlatform, OnInit } from "@angular/core";
import { Firestore, getDoc, where } from "@angular/fire/firestore";
import { MAT_DATE_FORMATS } from "@angular/material/core";
import { MatDatepicker } from "@angular/material/datepicker";
import { SessionInfo } from "@core/services/session-info/session-info.service";
import { Contract } from "@shared/classes/contract";
import { Invoice } from "@shared/classes/invoice";
import { Liquidation } from "@shared/classes/liquidation";
import { Payment } from "@shared/classes/payment";
import { Plant } from "@shared/classes/plant";
import { Product } from "@shared/classes/product";
import { Ticket } from "@shared/classes/ticket";
import * as Excel from "exceljs";

export const MY_FORMATS = {
	parse: {
		dateInput: "MM/YYYY",
	},
	display: {
		dateInput: "MM/YYYY",
		monthYearLabel: "MMM YYYY",
		dateA11yLabel: "LL",
		monthYearA11yLabel: "MMMM YYYY",
	},
};

@Component({
	selector: "app-monthly-tickets",
	templateUrl: "./monthly-tickets.component.html",
	styleUrls: ["./monthly-tickets.component.scss"],
	providers: [
		{
			provide: MAT_DATE_FORMATS,
			useValue: MY_FORMATS,
		},
	],
})
export class MonthlyTicketsComponent implements OnInit {
	public plants$: Promise<Plant[]>;
	public selectedPlant: Plant;
	public date: Date;
	public today: Date = new Date();
	public status: "idle" | "generating" | "complete" = "idle";
	private workbook: Excel.Workbook;
	private contracts: {[id: string]: Promise<Contract>} = {};
	private contractDocs: {
		[contractID: string]: {
			payments: Promise<Payment[]>,
			liquidations: Promise<Liquidation[]>,
			invoices: Promise<Invoice[]>
		}
	} = {};

	constructor(private db: Firestore, private session: SessionInfo) { }

	ngOnInit() {
		this.plants$ = Plant.getPlantList(this.db, this.session.getCompany());
	}

	setMonthAndYear(monthAndYear: Date, datepicker: MatDatepicker<Date>) {
		this.date = monthAndYear;
		datepicker.close();
	}

	async generateDocument(): Promise<void> {
		this.status = "generating";

		// Create end date for query
		const endDate = new Date();
		endDate.setFullYear(this.date.getFullYear(), this.date.getMonth() + 1, 1);
		endDate.setHours(23, 59, 59);
		endDate.setDate(0);

		// Get products
		const products = await Product.getProductList(
			this.db,
			this.session.getCompany()
		);

		// Get Tickets
		const allTickets = await Ticket.getTickets(
			this.db,
			this.session.getCompany(),
			this.selectedPlant.ref.id,
			where("dateOut", ">=", this.date),
			where("dateOut", "<=", endDate)
		);

		const productTickets: {
			in: {
				[productName: string]: Ticket[];
			};
			out: {
				[productName: string]: Ticket[];
			};
		} = { in: {}, out: {} };

		// Make sure all product groups exist in object
		products.forEach((p) => {
			productTickets.in[p.ref.id] = [];
			productTickets.out[p.ref.id] = [];
		});

		// Sort tickets into categories
		allTickets.sort((a, b) => a.id - b.id);
		const inTickets: Ticket[] = [];
		const outTickets: Ticket[] = [];

		for (let ticket of allTickets) {
			if(!this.contracts[ticket.contractRef.id]) {
				this.contracts[ticket.contractRef.id] = getDoc(ticket.contractRef).then(doc => doc.data());

				this.contracts[ticket.contractRef.id].then(c => {
					const liquidationsPromise = c.getLiquidations();
					const invoicesPromise = liquidationsPromise.then(liquidations => {
						const invoiceList: Promise<Invoice>[] = [];

						for(let liq of liquidations) {
							if(liq.invoiceRef) invoiceList.push(getDoc(liq.invoiceRef).then(result => {
								return result.data();
							}));
						}

						return Promise.all(invoiceList);
					});

					this.contractDocs[c.ref.id] = {
						liquidations: liquidationsPromise,
						payments: c.getPayments(),
						invoices: invoicesPromise
					}
				});
			}

			(ticket.in ? inTickets : outTickets).push(ticket);
			productTickets[ticket.type][ticket.productName].push(ticket);
		}

		// Crete workbook
		this.workbook = new Excel.Workbook();

		for (let type in productTickets) {
			for (let product in productTickets[type]) {
				const name = `${type} ${product}`.toUpperCase();
				const worksheet = this.workbook.addWorksheet(name);
				const reportInfo = type == 'in' ? this.inReportInfo : this.outReportInfo;

				worksheet.columns = reportInfo.headers;
				worksheet.addRows(await Promise.all((productTickets[type][product] as Ticket[]).map(reportInfo.map)));
			}
		}

		this.status = "complete";
	}

	download(): void {
		this.workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			});
	  
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.setAttribute("style", "display: none");
			a.href = url;
			a.download = `INVENTORY-${this.date.getFullYear()}-${this.date.getMonth() + 1}.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			a.remove();
		});
	}

	inReportInfo = {
		map: async (t: Ticket, index: number) => {
			const contract = await this.contracts[t.contractRef.id];
			const isService = contract.tags.includes("service");
			const liquidation = isService ? null : (await this.contractDocs[t.contractRef.id].liquidations).find(liq => liq.ticketRefs.some(tref => tref.id == t.ref.id));
			const payment = liquidation ? (await this.contractDocs[t.contractRef.id].payments).find(p => p.paidDocuments.some(doc => doc.ref.id == liquidation.ref.id)) : null;

			return [
				t.dateOut,
				t.id + (t.subId ? `-${t.subId}` : ""),
				t.original_ticket,
				t.void ? "VOID" : "",
				t.void ? "" : t.contractID,
				t.void ? "" : t.productName,
				t.void ? "" : t.clientName,
				t.void ? "" : t.gross.get(),
				t.void ? "" : t.tare.get(),
				t.void ? "" : t.net.get(),
				t.void ? "" : t.dryWeight.get(),
				t.void ? "" : {value: t.net.getMassInUnit("mTon"), numFmt: "0.000"},
				t.void ? "" : contract.price.getPricePerUnit('mTon', contract.quantity), // Price ($/mTon)
				t.void ? "" : {formula: `L${index + 2} * M${index + 2}`, numFmt: "$0.00" }, // SUBTOTAL
				t.void ? "" : t.freight.amount ? t.freight?.getPricePerUnit("CWT", contract.quantity) : contract.default_freight, // Freight price/cwt
				t.void ? "" : {formula: `O${index + 2} * J${index + 2} / 100`}, // Freight total
				t.void ? "" : payment?.notes,
			]
		}, 
		headers: [
			{ header: "DATE", width: 10 },
			{ header: "ACN TICKET #", width: 6 },
			{ header: "ORIGINAL TICKET", width: 9.8 },
			{ header: "VOID", width: 12 },
			{ header: "CONTRACT #", width: 6 },
			{ header: "PRODUCT", width: 13.6 },
			{ header: "FARMER", width: 24.5 },
			{ header: "WT-GROSS", width: 15.86 },
			{ header: "WT-TARE", width: 16.93 },
			{ header: "WT-NET", width: 16 },
			{ header: "SHRINK", width: 10.93 },
			{ header: "METRIC TONS", width: 12.27 },
			{ header: "PRICE", width: 10 },
			{ header: "SUBTOTAL", width: 14.13 },
			{ header: "FREIGHT PRICE / CWT", width: 12.7 },
			{ header: "FREIGHT PRICE TOTAL", width: 12.7 },
			{ header: "CHECK", width: 11 },
		]
	}

	outReportInfo = {
		map: async (t: Ticket, index: number) => {
			const contract = await this.contracts[t.contractRef.id];
			const isService = contract.tags.includes("service");
			const liquidation = isService ? null : (await this.contractDocs[t.contractRef.id].liquidations).find(liq => liq.ticketRefs.some(tref => tref.id == t.ref.id));
			const invoice = liquidation?.invoiceRef ? (await this.contractDocs[t.contractRef.id].invoices).find(inv => inv.ref.id == liquidation.invoiceRef.id) : null;

			return [
				t.dateOut,
				t.id + (t.subId ? `-${t.subId}` : ""),
				t.original_ticket,
				t.void ? "VOID" : "",
				t.void ? "" : t.contractID,
				t.void ? "" : t.productName,
				t.void ? "" : t.clientName,
				t.void ? "" : t.gross.get(),
				t.void ? "" : t.tare.get(),
				t.void ? "" : t.net.get(),
				t.void ? "" : t.dryWeight.get(),
				t.void ? "" : t.net.getMassInUnit("mTon"),
				t.void ? "" : invoice?.id, // INVOICE
				t.void ? "" : contract.price.getPricePerUnit('mTon', contract.quantity), // PRICE
				t.void ? "" : {formula: `N${index + 2} * L${index + 2}`}, // SUBTOTAL
				t.void ? "" : t.freight.amount ? t.freight?.getPricePerUnit("CWT", contract.quantity) : contract.default_freight, // Freight price/cwt
				t.void ? "" : {formula: `J${index + 2} * P${index + 2} / 100`}, // Freight total
				t.void ? "" : {formula: `O${index + 2} + Q${index + 2}`}, // Total
			]
		},
		headers: [
			{ header: "DATE", width: 10 },
			{ header: "ACN TICKET #", width: 6 },
			{ header: "ORIGINAL TICKET", width: 9.8 },
			{ header: "VOID", width: 12 },
			{ header: "CONTRACT #", width: 6 },
			{ header: "PRODUCT", width: 13.6 },
			{ header: "FARMER", width: 24.5 },
			{ header: "WT-GROSS", width: 15.86 },
			{ header: "WT-TARE", width: 16.93 },
			{ header: "WT-NET", width: 16 },
			{ header: "SHRINK", width: 10.93 },
			{ header: "METRIC TONS", width: 12.27 },
			{ header: "INVOICE", width: 9.5 },
			{ header: "PRICE", width: 9.5 },
			{ header: "Subtotal", width: 12.7 },
			{ header: "Freight Price", width: 12.7 },
			{ header: "Freight Total", width: 12.7 },
			{ header: "TOTAL", width: 12.5 },
		]
	}
}
