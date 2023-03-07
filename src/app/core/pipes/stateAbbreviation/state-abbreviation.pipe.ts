import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stateAbbreviation'
})
export class StateAbbreviationPipe implements PipeTransform {

  private states = new Map<string, string>([
    // Mexico
    // ['Aguascalientes', 'MX-AG'],
    // ['Baja California', 'MX-BC'],
    // ['Baja California Sur', 'MX-BS'],
    // ['Campeche', 'MX-CM'],
    // ['Chiapas', 'MX-CS'],
    // ['Chihuahua', 'MX-CH'],
    // ['Coahuila', 'MX-CO'],
    // ['Colima', 'MX-CL'],
    // ['Durango', 'MX-DG'],
    // ['Guanajuato', 'MX-GT'],
    // ['Guerrero', 'MX-GR'],
    // ['Hidalgo', 'MX-HG'],
    // ['Jalisco', 'MX-JA'],
    // ['Mexico', 'MX-EM'],
    // ['Mexico City', 'MX-DF'],
    // ['Michoacan', 'MX-MI'],
    // ['Morelos', 'MX-MO'],
    // ['Nayarit', 'MX-NA'],
    // ['Nuevo Leon', 'MX-NL'],
    // ['Oaxaca', 'MX-OA'],
    // ['Puebla', 'MX-PU'],
    // ['Queretaro', 'MX-QT'],
    // ['Quintana Roo', 'MX-QR'],
    // ['San Luis Potosi', 'MX-SL'],
    // ['Sinaloa', 'MX-SI'],
    // ['Sonora', 'MX-SO'],
    // ['Tabasco', 'MX-TB'],
    // ['Tamaulipas', 'MX-TM'],
    // ['Tlaxcala', 'MX-TL'],
    // ['Veracruz', 'MX-VE'],
    // ['Yucatan', 'MX-YU'],
    // ['Zacatecas', 'MX-ZA'],
    // US
    ['Alabama', 'AL'],
    ['Alaska', 'AK'],
    ['Arizona', 'AZ'],
    ['Arkansas', 'AR'],
    ['California', 'CA'],
    ['Colorado', 'CO'],
    ['Connecticut', 'CT'],
    ['Delaware', 'DE'],
    ['Florida', 'FL'],
    ['Georgia', 'GA'],
    ['Hawaii', 'HI'],
    ['Idaho', 'ID'],
    ['Illinois', 'IL'],
    ['Indiana', 'IN'],
    ['Iowa', 'IA'],
    ['Kansas', 'KS'],
    ['Kentucky', 'KY'],
    ['Louisiana', 'LA'],
    ['Maine', 'ME'],
    ['Maryland', 'MD'],
    ['Massachusetts', 'MA'],
    ['Michigan', 'MI'],
    ['Minnesota', 'MN'],
    ['Mississippi', 'MS'],
    ['Missouri', 'MO'],
    ['Montana', 'MT'],
    ['Nebraska', 'NE'],
    ['Nevada', 'NV'],
    ['New Hampshire', 'NH'],
    ['New Jersey', 'NJ'],
    ['New Mexico', 'NM'],
    ['New York', 'NY'],
    ['North Carolina', 'NC'],
    ['North Dakota', 'ND'],
    ['Ohio', 'OH'],
    ['Oklahoma', 'OK'],
    ['Oregon', 'OR'],
    ['Pennsylvania', 'PA'],
    ['Rhode Island', 'RI'],
    ['South Carolina', 'SC'],
    ['South Dakota', 'SD'],
    ['Tennessee', 'TN'],
    ['Texas', 'TX'],
    ['Utah', 'UT'],
    ['Vermont', 'VT'],
    ['Virginia', 'VA'],
    ['Washington', 'WA'],
    ['West Virginia', 'WV'],
    ['Wisconsin', 'WI'],
    ['Wyoming', 'WY'],
  ]);

  transform(state: string): string {
    return this.states.get(state.trim()) ?? state.trim();
  }
}