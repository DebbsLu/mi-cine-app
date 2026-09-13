import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Boleto } from '../../types';

export interface CodigoQR {
  id: string;
  idBoleto: string;
  token: string;
  estado: 'NO_ESCANEADO' | 'PARCIALMENTE_ESCANEADO' | 'ESCANEADO';
  usosActuales?: number; // Contador de escaneos realizados
}

// Extender el tipo de boleto en el slice si es necesario
interface TicketsState {
  tickets: Boleto[];
}

const initialState: TicketsState = {
  tickets: [],
};

export const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    addTicket: (state, action: PayloadAction<Boleto>) => {
      // Garantizar que el boleto inicie con 0 usos
      const newTicket = {
        ...action.payload,
        codigoQR: {
          ...action.payload.codigoQR,
          usosActuales: 0,
        },
      };
      state.tickets.push(newTicket);
    },
    validarYMarcarQR: (state, action: PayloadAction<string>) => {
      const ticket = state.tickets.find((t) => t.codigoQR.token === action.payload);
      if (ticket && ticket.codigoQR.estado !== 'ESCANEADO') {
        const limiteAsientos = ticket.asientosSeleccionados.length;
        const usos = (ticket.codigoQR.usosActuales || 0) + 1;

        ticket.codigoQR.usosActuales = usos;

        if (usos >= limiteAsientos) {
          ticket.codigoQR.estado = 'ESCANEADO';
        } else {
          ticket.codigoQR.estado = 'PARCIALMENTE_ESCANEADO';
        }
      }
    },
  },
});

export const { addTicket, validarYMarcarQR } = ticketsSlice.actions;
export default ticketsSlice.reducer;