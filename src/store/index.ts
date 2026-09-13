import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importación de reducers
import moviesReducer from './slices/moviesSlice';
import showtimesReducer from './slices/showtimesSlice';
import ticketsReducer from './slices/ticketsSlice';
import authReducer from './slices/authSlice';

// 1. Unificar todos los reducers incluyendo auth
const rootReducer = combineReducers({
  movies: moviesReducer,
  showtimes: showtimesReducer,
  tickets: ticketsReducer,
  auth: authReducer,
});

// 2. Configuración de persistencia en AsyncStorage
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Claves del estado que deseas conservar en la memoria local
  whitelist: ['movies', 'showtimes', 'tickets', 'auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 3. Configuración del Store con middleware para ignorar acciones no serializables de redux-persist
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// 4. Exportar el persistor para usarlo en el PersistGate dentro de App.tsx
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;