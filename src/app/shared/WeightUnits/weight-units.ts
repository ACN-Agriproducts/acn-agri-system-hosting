export class WeightUnits {
    static Pounds = new WeightUnits('Pounds', 'lbs', 1);
    static MetricTons = new WeightUnits('Metric Tons', 'MTons', 2204.6);
    static Hundredweight = new WeightUnits('Hundredweight', 'CWT', 100);

    name: string;
    shortName: string;
    toPounds: number;

    constructor(name: string, shortName: string, toPounds: number){
        this.name = name;
        this.shortName = shortName;
        this.toPounds = toPounds;
    }

    public static getUnits(name: string, bushelWeight: number = 56) {
        switch (name.toLowerCase()) {
            case 'lbs': return this.Pounds;
            case 'cwt': return this.Hundredweight;
            case 'mtons': return this.MetricTons;
            case 'bushels': return new WeightUnits('bushels', 'Bushels', bushelWeight);
        }
    }
}
