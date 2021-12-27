import { WeightUnits } from "@shared/WeightUnits/weight-units";

export class Weight {
    public amount: number;
    public unit: WeightUnits;

    constructor(amount?: number, unit?: WeightUnits) {
        this.amount = amount || 0;
        this.unit = unit || WeightUnits.Pounds;
    }

    public getPounds(): number{
        return this.amount * this.unit.toPounds;
    }

    public convertUnit(newUnit: WeightUnits): Weight {
        return new Weight(this.amount * this.unit.toPounds / newUnit.toPounds, newUnit);
    }
}
