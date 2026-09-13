import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Funcion, EstadoAsiento } from '../../types';

interface ShowtimesState {
  showtimes: Funcion[];
}

const initialSeats = (): Record<string, EstadoAsiento> => {
  const seats: Record<string, EstadoAsiento> = {};
  ['A', 'B', 'C', 'D'].forEach((row) => {
    [1, 2, 3, 4, 5].forEach((col) => {
      seats[`${row}${col}`] = 'Disponible';
    });
  });
  return seats;
};

const initialState: ShowtimesState = {
  showtimes: [
    {
      id: '1',
      idPelicula: '1',
      idSala: '1',
      fechaHora: 'Lunes 12; 15:00',
      asientosEstado: initialSeats(),
    },
  ],
};

export const showtimesSlice = createSlice({
  name: 'showtimes',
  initialState,
  reducers: {
    addShowtime: (
      state,
      action: PayloadAction<Omit<Funcion, 'id' | 'asientosEstado'>>
    ) => {
      const newShowtime: Funcion = {
        ...action.payload,
        id: Date.now().toString(),
        asientosEstado: initialSeats(),
      };
      state.showtimes.push(newShowtime);
    },

    updateShowtime: (
      state,
      action: PayloadAction<Omit<Funcion, 'asientosEstado'>>
    ) => {
      const index = state.showtimes.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        // Mantiene el mapa de asientos existente y actualiza película, sala y fechaHora
        state.showtimes[index] = {
          ...state.showtimes[index],
          idPelicula: action.payload.idPelicula,
          idSala: action.payload.idSala,
          fechaHora: action.payload.fechaHora,
        };
      }
    },

    deleteShowtime: (state, action: PayloadAction<string>) => {
      state.showtimes = state.showtimes.filter((s) => s.id !== action.payload);
    },

    updateSeatStatuses: (
      state,
      action: PayloadAction<{
        showtimeId: string;
        seatIds: string[];
        status: EstadoAsiento;
      }>
    ) => {
      const showtime = state.showtimes.find((s) => s.id === action.payload.showtimeId);
      if (showtime) {
        action.payload.seatIds.forEach((seatId) => {
          showtime.asientosEstado[seatId] = action.payload.status;
        });
      }
    },
  },
});

export const {
  addShowtime,
  updateShowtime,
  deleteShowtime,
  updateSeatStatuses,
} = showtimesSlice.actions;

export default showtimesSlice.reducer;