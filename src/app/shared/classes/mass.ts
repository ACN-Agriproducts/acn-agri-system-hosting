export declare type units = "lbs" | "kg" | "mTon";

const conversions: Map<units, number> = new Map<units, number>([
    ["lbs", 2.20462],
    ["kg", 1],
    ["mTon", 1000]
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

    getMassInUnit(unit: units) {
        return this.amount / conversions.get(this.defaultUnits) * conversions.get(unit);
    }
}
