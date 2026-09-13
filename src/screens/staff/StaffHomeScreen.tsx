import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';

// Actions desde Redux Slices
import { addMovie, updateMovie, deleteMovie } from '../../store/slices/moviesSlice';
import { addShowtime, updateShowtime,deleteShowtime } from '../../store/slices/showtimesSlice';

// Tipos desde la ubicación centralizada de types
import { Pelicula, Funcion, Boleto } from '../../types';

// Constantes
import { COLORS } from '../../config/constants';

// Opciones predefinidas
const GENRES = ['Acción', 'Comedia', 'Drama', 'Terror', 'Ciencia Ficción', 'Animación', 'Aventura'];
const RATINGS = ['A', 'B', 'B15', 'C', 'R'];
const ROOMS = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala VIP', 'Sala IMAX'];

export const StaffHomeScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();

  // Tipado explícito de selectores
  const movies = useAppSelector((state: RootState) => state.movies.movies);
  const showtimes = useAppSelector((state: RootState) => state.showtimes.showtimes);
  const tickets = useAppSelector((state: RootState) => state.tickets.tickets);

  // Modales
  const [isMovieModalVisible, setIsMovieModalVisible] = useState(false);
  const [isShowtimeModalVisible, setIsShowtimeModalVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Pelicula | null>(null);

  // Formulario Películas
  const [movieName, setMovieName] = useState('');
  const [movieGenre, setMovieGenre] = useState(GENRES[0]);
  const [movieDurationFormatted, setMovieDurationFormatted] = useState(''); // HH:MM:SS
  const [movieRating, setMovieRating] = useState(RATINGS[0]);
  const [moviePrice, setMoviePrice] = useState('');
  const [movieStatus, setMovieStatus] = useState<'Disponible' | 'No disponible'>('Disponible');

  // Formulario Funciones
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(ROOMS[0]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Manejo de DatePickers (Android / iOS)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Convertir HH:MM:SS a minutos para almacenar
  const parseHHMMSS2Minutes = (timeStr: string): number => {
    const parts = timeStr.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 3) {
      return parts[0] * 60 + parts[1] + Math.round(parts[2] / 60);
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parseInt(timeStr, 10) || 120;
  };

  // Convertir minutos a formato HH:MM:SS
  const parseMinutes2HHMMSS = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:00`;
  };

  // Auto-formatear input de Duración mientras el usuario escribe
  const handleDurationChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}:${cleaned.slice(4, 6)}`;
    }
    setMovieDurationFormatted(formatted);
  };

  // Métricas tipadas
  const totalMovies = movies.length;
  const totalShowtimes = showtimes.length;
  const totalTickets = tickets.reduce((acc: number, t: Boleto) => acc + t.asientosSeleccionados.length, 0);
  const totalRevenue = tickets.reduce((acc: number, t: Boleto) => acc + t.totalPagado, 0);

  let totalAvailableSeats = 0;
  let totalOccupiedSeats = 0;

  showtimes.forEach((st: Funcion) => {
    Object.values(st.asientosEstado).forEach((status) => {
      if (status === 'Disponible') totalAvailableSeats++;
      else totalOccupiedSeats++;
    });
  });

const handleSaveMovie = () => {
  // 1. Validar Nombre
  if (!movieName || movieName.trim() === '') {
    Alert.alert('Campo Requerido', 'Por favor ingresa el nombre de la película.');
    return;
  }

  // 2. Validar Género
  if (!movieGenre || movieGenre.trim() === '') {
    Alert.alert('Campo Requerido', 'Por favor selecciona un género.');
    return;
  }

  // 3. Validar Duración (HH:MM:SS)
  if (!movieDurationFormatted || movieDurationFormatted.length < 8) {
    Alert.alert(
      'Duración Inválida',
      'Por favor ingresa la duración completa en formato HH:MM:SS (ejemplo: 02:15:00).'
    );
    return;
  }

  // 4. Validar Clasificación
  if (!movieRating || movieRating.trim() === '') {
    Alert.alert('Campo Requerido', 'Por favor selecciona una clasificación.');
    return;
  }

  // 5. Validar Precio
  const parsedPrice = Number(moviePrice);
  if (!moviePrice || isNaN(parsedPrice) || parsedPrice <= 0) {
    Alert.alert('Precio Inválido', 'Por favor ingresa un precio válido mayor a 0.');
    return;
  }

  // Convertir duracion formateada a minutos usando la función existente
  const durationInMinutes = parseHHMMSS2Minutes(movieDurationFormatted);

  // 6. Construir o Actualizar el Objeto Película
  if (editingMovie) {
    dispatch(
      updateMovie({
        id: editingMovie.id,
        nombre: movieName.trim(),
        genero: movieGenre,
        duracion: durationInMinutes,
        clasificacion: movieRating,
        precio: parsedPrice,
        estado: movieStatus,
      })
    );
    Alert.alert('¡Éxito!', 'La película ha sido actualizada correctamente.');
  } else {
    dispatch(
      addMovie({        
        nombre: movieName.trim(),
        genero: movieGenre,
        duracion: durationInMinutes,
        clasificacion: movieRating,
        precio: parsedPrice,
        estado: movieStatus,
      })
    );
    Alert.alert('¡Éxito!', 'La película ha sido agregada al catálogo.');
  }

  resetMovieForm();
};

// Estado para saber si estamos editando una función
const [editingShowtime, setEditingShowtime] = useState<Funcion | null>(null);

// Abrir modal con los datos cargados para editar
const handleOpenEditShowtime = (showtime: Funcion) => {
  setEditingShowtime(showtime);
  setSelectedMovieId(showtime.idPelicula);
  setSelectedRoom(showtime.idSala);
  setIsShowtimeModalVisible(true);
};

// Confirmar y eliminar función
const handleDeleteShowtime = (showtimeId: string) => {
  Alert.alert(
    'Eliminar Función',
    '¿Estás seguro de que deseas eliminar esta función?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          dispatch(deleteShowtime(showtimeId));
          Alert.alert('¡Éxito!', 'La función ha sido eliminada.');
        },
      },
    ]
  );
};

  const handleOpenEditMovie = (movie: Pelicula) => {
    setEditingMovie(movie);
    setMovieName(movie.nombre);
    setMovieGenre(movie.genero);
    setMovieDurationFormatted(parseMinutes2HHMMSS(movie.duracion));
    setMovieRating(movie.clasificacion);
    setMoviePrice(movie.precio.toString());
    setMovieStatus(movie.estado);
    setIsMovieModalVisible(true);
  };

  const resetMovieForm = () => {
    setEditingMovie(null);
    setMovieName('');
    setMovieGenre(GENRES[0]);
    setMovieDurationFormatted('');
    setMovieRating(RATINGS[0]);
    setMoviePrice('');
    setMovieStatus('Disponible');
    setIsMovieModalVisible(false);
  };

const handleSaveShowtime = () => {
  if (!selectedMovieId) {
    Alert.alert('Campo Requerido', 'Por favor selecciona una película.');
    return;
  }
  if (!selectedRoom) {
    Alert.alert('Campo Requerido', 'Por favor selecciona una sala.');
    return;
  }

  const fechaFormatted = selectedDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const horaFormatted = selectedTime.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const fechaHoraCompleta = `${fechaFormatted}; ${horaFormatted}`;

  // Validar si la sala ya está ocupada en ese mismo horario
  const isRoomOccupied = showtimes.some((st: Funcion) => {
    // Si estamos editando, ignoramos la función actual que se está modificando
    if (editingShowtime && st.id === editingShowtime.id) {
      return false;
    }
    return st.idSala === selectedRoom && st.fechaHora === fechaHoraCompleta;
  });

  if (isRoomOccupied) {
    Alert.alert(
      'Horario No Disponible',
      `La Sala ${selectedRoom} ya tiene una función asignada para el ${fechaHoraCompleta}.`
    );
    return;
  }

  if (editingShowtime) {
    dispatch(
      updateShowtime({
        id: editingShowtime.id,
        idPelicula: selectedMovieId,
        idSala: selectedRoom,
        fechaHora: fechaHoraCompleta,
      })
    );
    Alert.alert('¡Éxito!', 'La función se ha actualizado correctamente.');
  } else {
    dispatch(
      addShowtime({
        idPelicula: selectedMovieId,
        idSala: selectedRoom,
        fechaHora: fechaHoraCompleta,
      })
    );
    Alert.alert('¡Éxito!', 'La función se ha añadido correctamente.');
  }

  // Resetear estados y cerrar modal
  setIsShowtimeModalVisible(false);
  setEditingShowtime(null);
  setSelectedMovieId('');
};

  return (
    <LinearGradient colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Dashboard */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dashboard</Text>
            <View style={styles.titleLine} />
          </View>

          <View style={styles.dashboardContainer}>
            <View style={styles.dashboardRow}>
              <View style={styles.labelWithIcon}>
                <Image
                  source={require('../../assets/icons/Peliculas.png')}
                  style={styles.dashIcon}
                />
                <Text style={styles.dashLabel}>Total de películas:</Text>
              </View>
              <Text style={styles.dashValue}>{totalMovies}</Text>
            </View>

            <View style={styles.dashboardRow}>
              <View style={styles.labelWithIcon}>
                <Image
                  source={require('../../assets/icons/funciones.png')}
                  style={styles.dashIcon}
                />
                <Text style={styles.dashLabel}>Total de funciones:</Text>
              </View>
              <Text style={styles.dashValue}>{totalShowtimes}</Text>
            </View>

            <View style={styles.dashboardRow}>
              <View style={styles.labelWithIcon}>
                <Image
                  source={require('../../assets/icons/Money.png')}
                  style={styles.dashIcon}
                />
                <Text style={styles.dashLabel}>Ingresos generados:</Text>
              </View>
              <Text style={styles.dashValue}>${totalRevenue.toFixed(2)}</Text>
            </View>

            <View style={styles.dashboardRow}>
              <View style={styles.labelWithIcon}>
                <Image
                  source={require('../../assets/icons/ticket.png')}
                  style={styles.dashIcon}
                />
                <Text style={styles.dashLabel}>Total de boletos vendidos:</Text>
              </View>
              <Text style={styles.dashValue}>{totalTickets}</Text>
            </View>

            <View style={styles.dashboardRow}>
              <View style={styles.labelWithIcon}>
                <Image
                  source={require('../../assets/icons/asientos.png')}
                  style={styles.dashIcon}
                />
                <Text style={styles.dashLabel}>Total de asientos disponibles:</Text>
              </View>
              <Text style={styles.dashValue}>{totalAvailableSeats}</Text>
            </View>

            <View style={styles.dashboardRow}>
              <View style={styles.labelWithIcon}>
                <Image
                  source={require('../../assets/icons/asientos.png')}
                  style={styles.dashIcon}
                />
                <Text style={styles.dashLabel}>Total de asientos ocupados:</Text>
              </View>
              <Text style={styles.dashValue}>{totalOccupiedSeats}</Text>
            </View>

            <View style={styles.dashboardRow}>
              <View style={styles.labelWithIcon}>
                <Image
                  source={require('../../assets/icons/star.png')}
                  style={styles.dashIcon}
                />
                <Text style={styles.dashLabel}>Película más reservada:</Text>
              </View>
              <Text style={styles.dashValue}>Spiderman...</Text>
            </View>
          </View>

          {/* Lista de Películas */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Películas</Text>
            <View style={styles.titleLine} />
          </View>

          <TouchableOpacity style={styles.blueGlowButton} onPress={() => setIsMovieModalVisible(true)}>
            <Text style={styles.blueGlowText}>+ Añadir película</Text>
          </TouchableOpacity>

          {movies.map((movie: Pelicula) => (
            <View key={movie.id} style={styles.itemCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{movie.nombre}</Text>
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.circleBtn} onPress={() => handleOpenEditMovie(movie)}>
                      <Image
                        source={require('../../assets/icons/edit.png')}
                        style={styles.actionIcon}
                      />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.circleBtn} onPress={() => dispatch(deleteMovie(movie.id))}>
                      <Image
                        source={require('../../assets/icons/delete.png')}
                        style={styles.actionIcon}
                      />
                    </TouchableOpacity>
                  </View>
              </View>
              <View style={styles.cardDetailsRow}>
                <Text style={styles.detailText}>Género: <Text style={styles.detailValue}>{movie.genero}</Text></Text>
                <Text style={styles.detailText}>Duración: <Text style={styles.detailValue}>{movie.duracion}m</Text></Text>
              </View>
              <View style={styles.cardDetailsRow}>
                <Text style={styles.detailText}>Clasificación: <Text style={styles.detailValue}>{movie.clasificacion}</Text></Text>
                <Text style={styles.detailText}>Estado: <Text style={styles.detailValue}>{movie.estado}</Text></Text>
              </View>
              <Text style={styles.detailText}>Precio: <Text style={styles.detailValue}>${movie.precio.toFixed(2)}</Text></Text>
            </View>
          ))}

{/* Lista de Funciones */}
<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>Funciones</Text>
  <View style={styles.titleLine} />
</View>

<TouchableOpacity
  style={styles.blueGlowButton}
  onPress={() => {
    setEditingShowtime(null);
    setSelectedMovieId('');
    setIsShowtimeModalVisible(true);
  }}
>
  <Text style={styles.blueGlowText}>+ Añadir función</Text>
</TouchableOpacity>

{showtimes.map((st: Funcion, index: number) => {
  const movie = movies.find((m: Pelicula) => m.id === st.idPelicula);
  return (
    <View key={st.id} style={styles.itemCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Función {index + 1}</Text>
        
        {/* Botones de Acción: Editar y Eliminar */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => handleOpenEditShowtime(st)}
          >
            <Image
              source={require('../../assets/icons/edit.png')}
              style={styles.actionIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => handleDeleteShowtime(st.id)}
          >
            <Image
              source={require('../../assets/icons/delete.png')}
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.detailText}>
        Película: <Text style={styles.detailValue}>{movie?.nombre || 'Desconocida'}</Text>
      </Text>
      <Text style={styles.detailText}>
        Fecha y Hora: <Text style={styles.detailValue}>{st.fechaHora}</Text>
      </Text>
      <Text style={styles.detailText}>
        Sala: <Text style={styles.detailValue}>{st.idSala}</Text>
      </Text>
    </View>
  );
})}
        </ScrollView>

        {/* Modal Película */}
        <Modal visible={isMovieModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingMovie ? 'Editar Película' : 'Añadir Película'}</Text>
                <TouchableOpacity style={styles.btnRojoCircularX} onPress={resetMovieForm}>
                  <Text style={styles.btnRojoText}>X</Text>
                </TouchableOpacity>
              </View>

              <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#aaa" value={movieName} onChangeText={setMovieName} />
              
              <Text style={styles.label}>Género:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={movieGenre}
                  dropdownIconColor="#fff"
                  style={styles.picker}
                  onValueChange={(itemValue) => setMovieGenre(itemValue)}
                >
                  {GENRES.map((g) => (
                    <Picker.Item key={g} label={g} value={g} color={Platform.OS === 'ios' ? '#fff' : '#000'} />
                  ))}
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Duración (HH:MM:SS)"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                maxLength={8}
                value={movieDurationFormatted}
                onChangeText={handleDurationChange}
              />

              <Text style={styles.label}>Clasificación:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={movieRating}
                  dropdownIconColor="#fff"
                  style={styles.picker}
                  onValueChange={(itemValue) => setMovieRating(itemValue)}
                >
                  {RATINGS.map((r) => (
                    <Picker.Item key={r} label={r} value={r} color={Platform.OS === 'ios' ? '#fff' : '#000'} />
                  ))}
                </Picker>
              </View>

              <TextInput style={styles.input} placeholder="Precio ($)" keyboardType="numeric" placeholderTextColor="#aaa" value={moviePrice} onChangeText={setMoviePrice} />

              <Text style={styles.label}>Estado:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={movieStatus}
                  dropdownIconColor="#fff"
                  style={styles.picker}
                  onValueChange={(itemValue) => setMovieStatus(itemValue as 'Disponible' | 'No disponible')}
                >
                  <Picker.Item label="Disponible" value="Disponible" color={Platform.OS === 'ios' ? '#fff' : '#000'} />
                  <Picker.Item label="No disponible" value="No disponible" color={Platform.OS === 'ios' ? '#fff' : '#000'} />
                </Picker>
              </View>

              <TouchableOpacity style={styles.transparentGlowBtn} onPress={handleSaveMovie}>
                <Text style={styles.transparentGlowText}>{editingMovie ? 'Guardar Cambios' : 'Añadir película'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Función */}
        <Modal visible={isShowtimeModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Añadir Función</Text>
                <TouchableOpacity style={styles.btnRojoCircularX} onPress={() => setIsShowtimeModalVisible(false)}>
                  <Text style={styles.btnRojoText}>X</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Selecciona la Película:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedMovieId}
                  dropdownIconColor="#fff"
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedMovieId(itemValue)}
                >
                  <Picker.Item label="-- Selecciona una Película --" value="" color="#888" />
                  {movies.map((m: Pelicula) => (
                    <Picker.Item key={m.id} label={m.nombre} value={m.id} color={Platform.OS === 'ios' ? '#fff' : '#000'} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Selecciona la Sala:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedRoom}
                  dropdownIconColor="#fff"
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedRoom(itemValue)}
                >
                  {ROOMS.map((r) => (
                    <Picker.Item key={r} label={r} value={r} color={Platform.OS === 'ios' ? '#fff' : '#000'} />
                  ))}
                </Picker>
              </View>

              {/* Selectores Nativos de Fecha y Hora */}
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.pickerButtonText}>📅 Fecha: {selectedDate.toLocaleDateString('es-ES')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.pickerButtonText}>
                  ⏰ Hora: {selectedTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setSelectedDate(date);
                  }}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="default"
                  onChange={(event, time) => {
                    setShowTimePicker(false);
                    if (time) setSelectedTime(time);
                  }}
                />
              )}

              <TouchableOpacity style={styles.transparentGlowBtn} onPress={handleSaveShowtime}>
                <Text style={styles.transparentGlowText}>Añadir Función</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

          {/* Navegación Inferior */}
          <View style={styles.bottomNavContainer}>
            <TouchableOpacity style={styles.navButtonActive}>
              <Image
                source={require('../../assets/icons/Home.png')}
                style={styles.bottomNavIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('QRScanner')}
            >
              <Image
                source={require('../../assets/icons/QR.png')}
                style={styles.bottomNavIcon}
              />
            </TouchableOpacity>
          </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionHeader: { marginTop: 20, marginBottom: 10 },
  sectionTitle: { color: COLORS.textWhite, fontSize: 18, fontWeight: 'bold' },
  titleLine: { height: 2, backgroundColor: COLORS.titleYellow, marginTop: 4, width: 40 },
  dashboardContainer: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12 },
  dashboardRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  dashLabel: { color: '#ccc', fontSize: 14 },
  dashValue: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
blueGlowButton: {
  backgroundColor: '#0E1523',
  borderColor: 'rgba(251, 254, 255, 0.20)',
  borderWidth: 1,
  borderRadius: 25, // Forma de cápsula/pill redonda
  paddingVertical: 12,
  paddingHorizontal: 20,
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: 10,
  
  // Efecto Glow (iOS)
  shadowColor: '#3E3E6B',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.9,
  shadowRadius: 10,

  // Efecto Glow / Elevación (Android)
  elevation: 8,
},
  labelWithIcon: {
  flexDirection: 'row',
  alignItems: 'center',
},
dashIcon: {
  width: 18,
  height: 18,
  marginRight: 8,
  resizeMode: 'contain',
},
navBarIcon: {
  width: 24,
  height: 24,
  resizeMode: 'contain',
},
actionIcon: {
  width: 18,
  height: 18,
  resizeMode: 'contain',
},
  blueGlowText: {
  color: COLORS.textWhite, // O '#FFFFFF'
  fontSize: 15,
  fontWeight: '500',
},
  itemCard: { backgroundColor: 'rgba(255,255,255,0.08)', padding: 15, borderRadius: 10, marginVertical: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  actionButtonsRow: { flexDirection: 'row' },
  circleBtn: { marginLeft: 10 },
  btnIcon: { fontSize: 16 },
  cardDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  detailText: { color: '#aaa', fontSize: 13 },
  detailValue: { color: '#fff', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#1e1e2d', padding: 20, borderRadius: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
btnRojoCircularX: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.redAlert,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnRojoText: { color: COLORS.textWhite, fontWeight: 'bold' },
  modalBody: { gap: 8 },
  modalMovieName: { color: COLORS.textWhite, fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  modalDetailText: { color: COLORS.textPurple, fontSize: 15 },
  btnAzulGlow: {
    backgroundColor: '#0E1523',
    borderColor: 'rgba(251, 254, 255, 0.20)',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#3E3E6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 5,
  },
  label: { color: '#ccc', marginTop: 10, marginBottom: 5 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', padding: 10, borderRadius: 8, marginVertical: 6 },
  pickerContainer: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, marginVertical: 6 },
  picker: { color: '#fff' },
  pickerButton: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, marginVertical: 6 },
  pickerButtonText: { color: '#fff' },
  transparentGlowBtn: {
  backgroundColor: 'transparent', // Sin fondo
  borderColor: 'rgba(251, 254, 255, 0.20)', // Borde #FBFEFF al 20% de opacidad
  borderWidth: 1,
  borderRadius: 25, // Forma de cápsula/pill
  paddingVertical: 12,
  paddingHorizontal: 20,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 15,

  // Efecto Glow (iOS)
  shadowColor: '#3E3E6B',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.9,
  shadowRadius: 10,

  // Efecto Glow / Elevación (Android)
  elevation: 6,
},
  transparentGlowText: {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '500',
},
  bottomNavContainer: {
  position: 'absolute',
  bottom: 45,
  left: 0,
  right: 0,
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 20,
  zIndex: 10,
},
navButton: {
  width: 50,
  height: 50,
  borderRadius: 25,
  borderColor: 'rgba(251, 254, 255, 0.20)',
  borderWidth: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(245, 245, 245, 0.05)',
},
navButtonActive: {
  width: 50,
  height: 50,
  borderRadius: 25,
  borderColor: 'rgba(251, 254, 255, 0.20)',
  borderWidth: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#0E1523',
},
bottomNavIcon: {
  width: 22,
  height: 22,
  resizeMode: 'contain',
},
  navIcon: { fontSize: 20 },
});