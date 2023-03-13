import { conversions, units } from "./mass";

export class Price {
    private _amount: number;
    private _unit: units;

    constructor(amount: number, unit: units) {
        this._amount = amount;
        this._unit = unit;
    }

    public getPriceInUnit(priceUnit: units): number {
        if (!this.unit) return;
        return this._amount / conversions.get(this._unit) * conversions.get(priceUnit);
    }

    public set amount(newAmount: number) {
        this._amount = newAmount;
    }

    public get unit(): units {
        return this._unit;
    }

    public set unit(newUnit: units) {
        this._unit = newUnit;
    }

}
