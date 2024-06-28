import { Component, createPlatform, OnInit } from "@angular/core";
import { Firestore, where } from "@angular/fire/firestore";
import { MAT_DATE_FORMATS } from "@angular/material/core";
import { MatDatepicker } from "@angular/material/datepicker";
import { SessionInfo } from "@core/services/session-info/session-info.service";
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
	public workbook: Excel.Workbook;

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
			(ticket.in ? inTickets : outTickets).push(ticket);
			productTickets[ticket.type][ticket.productName].push(ticket);
		}

		// Crete workbook
		this.workbook = new Excel.Workbook();
		console.log(productTickets);

		for (let type in productTickets) {
			for (let product in productTickets[type]) {
				const name = `${type} ${product}`.toUpperCase();
				const worksheet = this.workbook.addWorksheet(name);
				const reportInfo = type == 'in' ? this.inReportInfo : this.outReportInfo;

				console.log(reportInfo, product, type, productTickets[type][product]);

				worksheet.columns = reportInfo.headers;
				worksheet.addRows((productTickets[type][product] as Ticket[]).map(reportInfo.map));
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
		map: (t: Ticket) => [
			t.dateOut,
			t.id + (t.subId ? `-${t.subId}` : null),
			t.original_ticket,
			t.void ? "VOID" : null,
			t.void ? null : t.contractID,
			t.void ? null : t.productName,
			t.void ? null : t.clientName,
			t.void ? null : t.gross.get(),
			t.void ? null : t.tare.get(),
			t.void ? null : t.net.get(),
			t.void ? null : t.dryWeight.get(),
			t.void ? null : t.net.getMassInUnit("mTon"),
			t.void ? null : null, // Price ($/mTon)
			t.void ? null : null, // Proveedor ?
			t.void ? null : null, // Freight price/cwt
			t.void ? null : null, // Freight total
			t.void ? null : null, // Cheque
		],
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
			{ header: "PROVEEDOR", width: 14.13 },
			{ header: "FREIGHT PRICE / CWT", width: 12.7 },
			{ header: "CHEQUE", width: 11 },
		]
	}

	outReportInfo = {
		map: (t: Ticket) => [
			t.dateOut,
			t.id + (t.subId ? `-${t.subId}` : null),
			t.original_ticket,
			t.void ? "VOID" : null,
			t.void ? null : t.contractID,
			t.void ? null : t.productName,
			t.void ? null : t.clientName,
			t.void ? null : t.gross.get(),
			t.void ? null : t.tare.get(),
			t.void ? null : t.net.get(),
			t.void ? null : t.dryWeight.get(),
			t.void ? null : t.net.getMassInUnit("mTon"),
			t.void ? null : null, // Price ($/mTon)
			t.void ? null : null, // Proveedor ?
			t.void ? null : null, // Freight price/cwt
			t.void ? null : null, // Freight total
			t.void ? null : null, // Cheque
		],
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
			{ header: "Freight Price", width: 12.7 },
			{ header: "TOTAL", width: 12.5 },
		]
	}
}
