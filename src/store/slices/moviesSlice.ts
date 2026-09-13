import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pelicula } from '../../types';

interface MoviesState {
  movies: Pelicula[];
}

const initialState: MoviesState = {
  movies: [
    {
      id: '1',
      nombre: 'Spiderman: Brand New Day',
      genero: 'Acción',
      duracion: 145,
      clasificacion: 'B',
      precio: 12.50,
      estado: 'Disponible',
    },
    {
      id: '2',
      nombre: 'Avengers: Secret Wars',
      genero: 'Sci-Fi',
      duracion: 180,
      clasificacion: 'B15',
      precio: 15.00,
      estado: 'Disponible',
    },
  ],
};

export const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    addMovie: (state, action: PayloadAction<Omit<Pelicula, 'id'>>) => {
      const newMovie: Pelicula = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.movies.push(newMovie);
    },
    updateMovie: (state, action: PayloadAction<Pelicula>) => {
      const index = state.movies.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.movies[index] = action.payload;
      }
    },
    deleteMovie: (state, action: PayloadAction<string>) => {
      state.movies = state.movies.filter((m) => m.id !== action.payload);
    },
  },
});

export const { addMovie, updateMovie, deleteMovie } = moviesSlice.actions;
export default moviesSlice.reducer;