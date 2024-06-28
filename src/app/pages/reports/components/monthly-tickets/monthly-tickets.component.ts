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

		for (let type in productTickets) {
			for (let product in productTickets[type]) {
				const name = `${type} ${product}`.toUpperCase();
				const worksheet = this.workbook.addWorksheet(name);
				const reportInfo = type == 'in' ? this.inReportInfo : this.outReportInfo;

				worksheet.addTable({
					name: `${name}-TABLE`,
					ref: "A1",
					headerRow: true,
					totalsRow: false,
					style: {
						theme: "TableStyleLight11",
						showRowStripes: false,
					},
					columns: reportInfo.headers,
					rows: productTickets[type][product].map(reportInfo.map),
				});
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
			t.void ? null : null, // Freight
			t.void ? null : t.dryWeight.get(),
			t.void ? null : t.net.getMassInUnit("mTon"),
			t.void ? null : null, // Price ($/mTon)
			t.void ? null : null, // Proveedor ?
			t.void ? null : null, // Freight price/cwt
			t.void ? null : null, // Freight total
			t.void ? null : null, // Cheque
		],
		headers: [
			{ name: "DATE", filterButton: false },
			{ name: "ACN TICKET #", filterButton: false },
			{ name: "ORIGINAL TICKET", filterButton: false },
			{ name: "VOID", filterButton: false },
			{ name: "CONTRACT #", filterButton: false },
			{ name: "PRODUCT", filterButton: false },
			{ name: "FARMER", filterButton: false },
			{ name: "WT-GROSS", filterButton: false },
			{ name: "WT-TARE", filterButton: false },
			{ name: "WT-NET", filterButton: false },
			{ name: "Freight Price", filterButton: false },
			{ name: "SHRINK", filterButton: false },
			{ name: "METRIC TONS", filterButton: false },
			{ name: "PRICE", filterButton: false },
			{ name: "PROVEEDOR", filterButton: false },
			{ name: "FREIGHT PRICE / CWT", filterButton: false },
			{ name: "CHEQUE", filterButton: false },
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
			{ name: "DATE", filterButton: false },
			{ name: "ACN TICKET #", filterButton: false },
			{ name: "ORIGINAL TICKET", filterButton: false },
			{ name: "VOID", filterButton: false },
			{ name: "CONTRACT #", filterButton: false },
			{ name: "PRODUCT", filterButton: false },
			{ name: "FARMER", filterButton: false },
			{ name: "DRIVER", filterButton: false },
			{ name: "WT-GROSS", filterButton: false },
			{ name: "WT-TARE", filterButton: false },
			{ name: "WT-NET", filterButton: false },
			{ name: "Freight Price", filterButton: false },
			{ name: "SHRINK", filterButton: false },
			{ name: "METRIC TONS", filterButton: false },
			{ name: "INVOICE", filterButton: false },
			{ name: "PRICE", filterButton: false },
			{ name: "TOTAL", filterButton: false },
		]
	}
}
