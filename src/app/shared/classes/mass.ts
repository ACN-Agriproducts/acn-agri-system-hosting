import { ProductInfo } from "./contract";
import { Product } from "./product";

export const UNIT_LIST = ["lbs", "kg", "mTon", "CWT", "bu"] as const;
export declare type units = typeof UNIT_LIST[number];

const unitNameMap: Map<string, string> = new Map<string, string>([
    ["lbs", "pounds"],
    ["kg", "kilograms"],
    ["mTon", "metric tons"],
    ["CWT", "hundedweight"],
    ["bu", "bushels"],
]);

export class Mass {
    defaultUnits: units;
    amount: number;

    readonly conversions: Map<units, number> = new Map<units, number>([
        ["lbs", 2.20462],
        ["kg", 1],
        ["mTon", .001],
        ["CWT", .0220462],
    ]);
    
    constructor(_amount: number, unit: units, product?: Product | ProductInfo) {
        this.amount = _amount;
        this.defaultUnits = unit;

        if(product) this.defineBushels(product);
    }

    get(): number {
        return this.amount;
    }

    getUnit(): units {
        return this.defaultUnits;
    }

    getMassInUnit(unit: units): number {
        const unitConversion = this.conversions.get(unit) / this.conversions.get(this.defaultUnits);
        return this.amount * unitConversion;
    }

    getBushelWeight(product: Product | ProductInfo): number {
        return this.getMassInUnit('lbs') / product?.weight;
    }

    add(addend: Mass): Mass {
        const amount = this.get() + addend.getMassInUnit(this.defaultUnits);
        return new Mass(amount, this.defaultUnits);
    }

    subtract(subtrahend: Mass): Mass {
        const amount = this.get() - subtrahend.getMassInUnit(this.defaultUnits);
        return new Mass(amount, this.defaultUnits);
    }

    defineBushels(product: Product | ProductInfo): void {
        this.conversions.set("bu", this.conversions.get("lbs") / product?.weight);
    }

    static getUnitFullName(unit: units): string {
        return unitNameMap.get(unit);
    }

    getRawData() {
        return {
            defaultUnits: this.defaultUnits,
            amount: this.amount
        }
    }
}
