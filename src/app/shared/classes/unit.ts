

declare type units = 'kg' | 'lb' | 't';

export class WeightUnit {
    constructor(private amount: number, private unit?: units) {};

    private conversions: Map<string, number> = new Map<string, number>([
        ['kg', 1], ['lb', 2.20462], ['t', 1000]
    ]);

    public get(unit: units = this.unit): number {
        return this.amount;
    }

    public set(amount: number, unit: units = this.unit): void {
        this.amount = amount;
        this.unit = unit;
    }

    public convertTo(unit: units): number {
        this.amount = this.amount * this.conversions.get(this.unit) / this.conversions.get(unit);
        this.unit = unit;

        return this.amount;
    }

    public defineBushels(productName: string, bushelAmount: number) {
        this.conversions.set(productName + "Bushels", bushelAmount);
    }
}
