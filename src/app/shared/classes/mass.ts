import { ProductInfo } from "./contract";
import { Product } from "./product";

export declare type units = "lbs" | "kg" | "mTon" | "CWT";

export const conversions: Map<units, number> = new Map<units, number>([
    ["lbs", 2.20462],
    ["kg", 1],
    ["mTon", .001],
    ["CWT", .00220462]
]);

export class Mass {
    defaultUnits: units;
    amount: number;

    constructor(_amount: number, unit: units) {
        this.amount = _amount;
        this.defaultUnits = unit;
    }

    get(): number {
        return this.amount;
    }

    getUnit(): units {
        return this.defaultUnits;
    }

    getMassInUnit(unit: units): number {
        return this.amount / conversions.get(this.defaultUnits) * conversions.get(unit);
    }

    getBushelWeight(product: Product | ProductInfo): number {
        return this.getMassInUnit('lbs') / product.weight;
    }

    add(addend: Mass): Mass {
        const amount = this.get() + addend.getMassInUnit(this.defaultUnits);
        return new Mass(amount, this.defaultUnits);
    }

    subtract(subtrahend: Mass): Mass {
        const amount = this.get() - subtrahend.getMassInUnit(this.defaultUnits);
        return new Mass(amount, this.defaultUnits);
    }
}
