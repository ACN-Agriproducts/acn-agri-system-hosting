import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { ContractSettings, FormField } from '@shared/classes/contract-settings';
import { Mass, units } from '@shared/classes/mass';

@Injectable({
  providedIn: 'root'
})
export class PrintableContractUtilitiesService {
  private contractSettings$: Promise<ContractSettings>

  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) {
    this.contractSettings$ = ContractSettings.getDocument(this.db, this.session.getCompany());
  }

  getUnitName(unit: units): string {
    return Mass.getUnitFullName(unit);
  }

  async selectFieldDisplay(contractType: string, fieldName: string, value: string): Promise<string> {
    const contractGroups = (await this.contractSettings$).formData[contractType];
    let field: FormField;

    for(let groupName in contractGroups) {
      for(let fieldInfo of contractGroups[groupName]) {
        if(fieldInfo.fieldName == fieldName) {
          field = fieldInfo;
          break;
        }
      }

      if(field) break;
    }
    return field.selectOptions?.find(option => option.value == value)?.label ?? "";
  }
}

@Pipe({
  name: 'selectFieldDisplay'
})
export class SelectFieldDisplayPipe implements PipeTransform {
  constructor(private utils: PrintableContractUtilitiesService) {}

  transform(value: string, contractType: string, fieldName: string): Promise<string> {
    return this.utils.selectFieldDisplay(contractType, fieldName, value);
  }
}

@Pipe({
  name: 'numberNameSpanish'
})
export class NumberNameSpanishPipe implements PipeTransform {
  transform(num: number): string {
    if(typeof num != "number") return "";
    return numeroALetras(num);
  }
}

const numeroALetras = (num: number) => {
  let data = {
    numero: num,
    enteros: Math.floor(num),
    decimales: Math.round(num * 100) - Math.floor(num) * 100,
    letrasDecimales: '',
  }

  if (data.decimales > 0) data.letrasDecimales = ' PUNTO ' + Millones(data.decimales)

  if (data.enteros == 0) return 'CERO' + data.letrasDecimales
  if (data.enteros == 1) return Millones(data.enteros) + data.letrasDecimales
  else return Millones(data.enteros) + data.letrasDecimales
}

const Unidades = (num: number) => {
  const aLetras = {
    1: 'UNO',
    2: 'DOS',
    3: 'TRES',
    4: 'CUATRO',
    5: 'CINCO',
    6: 'SEIS',
    7: 'SIETE',
    8: 'OCHO',
    9: 'NUEVE',
  }

  return aLetras[num] || ''
} // Unidades()

const Decenas = (num: number) => {
  let decena = Math.floor(num / 10)
  let unidad = num - decena * 10

  const aLetras = {
    1: (() => {
      const aLetra = {
        0: 'DIEZ',
        1: 'ONCE',
        2: 'DOCE',
        3: 'TRECE',
        4: 'CATORCE',
        5: 'QUINCE',
      }
      return aLetra[unidad] || 'DIECI' + Unidades(unidad)
    })(),
    2: unidad == 0 ? 'VEINTE' : 'VEINTI' + Unidades(unidad),
    3: DecenasY('TREINTA', unidad),
    4: DecenasY('CUARENTA', unidad),
    5: DecenasY('CINCUENTA', unidad),
    6: DecenasY('SESENTA', unidad),
    7: DecenasY('SETENTA', unidad),
    8: DecenasY('OCHENTA', unidad),
    9: DecenasY('NOVENTA', unidad),
    0: Unidades(unidad),
  }

  return aLetras[decena] || ''
} //Decenas()

const DecenasY = (strSin: string, numUnidades: number) => {
  if (numUnidades > 0) return strSin + ' Y ' + Unidades(numUnidades)
  return strSin
} //DecenasY()

const Centenas = (num: number) => {
  let centenas = Math.floor(num / 100)
  let decenas = num - centenas * 100

  const aLetras = {
    1: decenas > 0 ? 'CIENTO ' + Decenas(decenas) : 'CIEN',
    2: 'DOSCIENTOS ' + Decenas(decenas),
    3: 'TRESCIENTOS ' + Decenas(decenas),
    4: 'CUATROCIENTOS ' + Decenas(decenas),
    5: 'QUINIENTOS ' + Decenas(decenas),
    6: 'SEISCIENTOS ' + Decenas(decenas),
    7: 'SETECIENTOS ' + Decenas(decenas),
    8: 'OCHOCIENTOS ' + Decenas(decenas),
    9: 'NOVECIENTOS ' + Decenas(decenas),
  }

  return aLetras[centenas] || Decenas(decenas)
} //Centenas()

const Seccion = (num: number, divisor: number, strSingular: string, strPlural: string) => {
  let cientos = Math.floor(num / divisor)
  let resto = num - cientos * divisor

  let letras = ''

  if (cientos > 0)
    if (cientos > 1) letras = Centenas(cientos) + ' ' + strPlural
    else letras = strSingular

  if (resto > 0) letras += ''

  return letras
} //Seccion()

const Miles = (num: number) => {
  let divisor = 1000
  let cientos = Math.floor(num / divisor)
  let resto = num - cientos * divisor

  let strMiles = Seccion(num, divisor, 'UN MIL', 'MIL')
  let strCentenas = Centenas(resto)

  if (strMiles == '') return strCentenas
  return strMiles + ' ' + strCentenas
} //Miles()

const Millones = (num: number) => {
  let divisor = 1000000
  let cientos = Math.floor(num / divisor)
  let resto = num - cientos * divisor

  let strMillones = Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE')
  let strMiles = Miles(resto)

  if (strMillones == '') return strMiles
  return strMillones + ' ' + strMiles
} //Millones()