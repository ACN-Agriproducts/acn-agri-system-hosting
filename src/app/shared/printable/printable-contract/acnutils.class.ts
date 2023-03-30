import { Mass, units } from "@shared/classes/mass";

export class Utils {
    static getUnitName(unit: units): string {
       return Mass.getUnitFullName(unit);
    }

    static nameNumberSpanish(num: number): string {
        console.log(num, typeof num);
        if(typeof num != "number") return "";
        return numeroALetras(num);
    }
}


//From https://gist.github.com/alfchee/e563340276f89b22042a
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
  
  console.log(numeroALetras(651.413))
  // Expected: SEISCIENTOS CINCUENTA Y UNO PUNTO CUARENTA Y UNO