import { ProductInfo } from "./contract";
import { Product } from "./product";

export const UNIT_LIST = ["lbs", "kg", "mTon", "CWT", "bu", "tn"] as const;
export declare type units = typeof UNIT_LIST[number];

export const unitNameMap: Map<units, string> = new Map<units, string>([
    ["lbs", "pounds"],
    ["kg", "kilograms"],
    ["mTon", "metric tons"],
    ["CWT", "hundredweight"],
    ["bu", "bushels"],
    ["tn", "short tons"]
]);

export class Mass {
    defaultUnits: units;
    amount: number;

    readonly conversions: Map<units, number> = new Map<units, number>([
        ["lbs", 2.20462],
        ["kg", 1],
        ["mTon", .001],
        ["CWT", .0220462],
        ["tn", .00110231]
    ]);
    
    constructor(_amount: number, unit: units, product?: Product | ProductInfo | number) {
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
        if (this.defaultUnits === 'bu' && !addend.conversions.get('bu')) addend.defineBushels(this.conversions.get('bu'));
        const amount = this.get() + (addend?.getMassInUnit(this.defaultUnits) ?? 0);
        return new Mass(amount, this.defaultUnits, this.conversions.get('bu'));
    }

    subtract(subtrahend: Mass): Mass {
        const amount = this.get() - subtrahend.getMassInUnit(this.defaultUnits);
        return new Mass(amount, this.defaultUnits, this.conversions.get('bu'));
    }

    defineBushels(product: Product | ProductInfo | number): void {
        if(typeof product == 'number') this.conversions.set("bu", product);
        else this.conversions.set("bu", this.conversions.get("lbs") / product?.weight);
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
