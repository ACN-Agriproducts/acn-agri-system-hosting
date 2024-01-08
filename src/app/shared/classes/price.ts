import { Pipe, PipeTransform } from "@angular/core";
import { Mass, units } from "./mass";

export class Price {
    public amount: number;
    public unit: units;

    constructor(priceAmount: number, priceUnit: units) {
        this.amount = priceAmount;
        this.unit = priceUnit;
    }

    /**
     * 
     * @param priceUnit unit of measurement the price will be based on
     * @param mass must provide if the desired unit to convert the price to is bushels
     * @returns price per unit ($/unit)
     */
    public getPricePerUnit(priceUnit: units, mass: Mass = new Mass(null, null)): number {
        if (this.unit === priceUnit) return this.amount;

        const unitConversion = mass.conversions.get(priceUnit) / mass.conversions.get(this.unit);
        return this.amount / unitConversion;
    }
}

@Pipe({
    name: 'pricePerUnit'
})
export class pricerPerUnitPipe implements PipeTransform {
    transform(value: Price, unit?: units, massOrSomething?: Mass | any, ...args: unknown[]): number {
        const mass: Mass = massOrSomething instanceof Mass ? massOrSomething : new Mass(null, null);
        return (unit || value.unit) ? value.getPricePerUnit(unit || value.unit, mass) : value.amount;
    }
}


