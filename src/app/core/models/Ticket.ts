export interface Ticket {
    id: string; // id
    in: string; // dentro
    dateIn: Date; // fecha salida
    dateOut: Date; // fecha salida
    contract: string; // contrato
    product: string; // producto
    truckerID: string; // id del camionero
    vehicleID: string; // id del vehículo
    plates: string; // placa
    driver: string; // chofer
    truckerName: string; // nombre camionero
    gross: string; // bruto - bruta
    tare: string; // tara
    moisture: string; // humedad
    dryWeight: string; // peso en seco
    weight: string; // peso
    original_weight: string; // peso original
    plague: string; // plaga
    PPB: string; // PPG
    grade: string; // grado
    origin: string; // origin
    tank: string; // tanque
    comment: string; // comentarios
}
