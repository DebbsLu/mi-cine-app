export type EstadoPelicula = 'Disponible' | 'No disponible';
export type EstadoAsiento = 'Disponible' | 'Ocupado';
export type EstadoQR = 'NO_ESCANEADO' | 'PARCIALMENTE_ESCANEADO' | 'ESCANEADO';

export interface Pelicula {
  id: string;
  nombre: string;
  genero: string;
  duracion: number; // en minutos
  clasificacion: string; // ej. "PG-13", "R"
  precio: number;
  estado: EstadoPelicula;
}

export interface Sala {
  id: string;
  nombre: string; // "Sala 1", "Sala 2", "Sala 3"
}

export interface Asiento {
  id: string; // ej. "A1", "B2"
  idSala: string;
  estado: EstadoAsiento;
}

export interface Funcion {
  id: string;
  idPelicula: string;
  idSala: string;
  fechaHora: string; // ISO String
  asientosEstado: Record<string, EstadoAsiento>; // Mapa "A1": "Disponible", "A2": "Ocupado"
}

export interface CodigoQR {
  id: string;
  idBoleto: string;
  token: string;
  estado: EstadoQR;
  usosActuales?: number; // Agrega esta propiedad opcional
}

export interface Boleto {
  id: string;
  idPelicula: string;
  idFuncion: string;
  idSala: string;
  asientosSeleccionados: string[]; // ["A1", "A2"]
  fechaHoraFuncion: string;
  totalPagado: number;
  codigoQR: CodigoQR;
  fechaCompra: string;
}