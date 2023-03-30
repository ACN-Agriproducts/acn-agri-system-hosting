import { Mass, units } from "@shared/classes/mass";

export class Utils {
    static getUnitName(unit: units): string {
       return Mass.getUnitFullName(unit);
    }
}