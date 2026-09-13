import { configureStore } from '@reduxjs/toolkit';
import moviesReducer from './slices/moviesSlice';
import showtimesReducer from './slices/showtimesSlice';
import ticketsReducer from './slices/ticketsSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    movies: moviesReducer,
    showtimes: showtimesReducer,
    tickets: ticketsReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;