import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';

// Actions
import { addTicket } from '../../store/slices/ticketsSlice';

// Tipos centralizados
import { Pelicula, Funcion, Boleto} from '../../types';

// Constantes
import { COLORS } from '../../config/constants';

// Configuración de la matriz de asientos de la sala (Filas A-D, Columnas 1-5)
const ROWS = ['A', 'B', 'C', 'D'];
const COLS = [1, 2, 3, 4, 5];

export const TicketPurchaseScreen = ({ navigation, route }: any) => {
  const dispatch = useAppDispatch();

  // Obtener películas y funciones del Store global
  const movies = useAppSelector((state: RootState) => state.movies.movies);
  const showtimes = useAppSelector((state: RootState) => state.showtimes.showtimes);

  // Película precargada (si proviene de HomeScreen)
  const initialMovieParam: Pelicula | undefined = route?.params?.movie;

  // Estados de Formulario
  const [selectedMovieId, setSelectedMovieId] = useState<string>(
    initialMovieParam?.id || (movies.length > 0 ? movies[0].id : '')
  );

  // Funciones disponibles para la película seleccionada
  const availableShowtimes = useMemo(() => {
    return showtimes.filter((st: Funcion) => st.idPelicula === selectedMovieId);
  }, [showtimes, selectedMovieId]);

  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>(
    availableShowtimes.length > 0 ? availableShowtimes[0].id : ''
  );

  // Asientos seleccionados
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Película seleccionada
  const currentMovie = useMemo(() => {
    return movies.find((m: Pelicula) => m.id === selectedMovieId);
  }, [movies, selectedMovieId]);

  // Función seleccionada
  const currentShowtime = useMemo(() => {
    return showtimes.find((st: Funcion) => st.id === selectedShowtimeId);
  }, [showtimes, selectedShowtimeId]);

  // Asientos ocupados ficticios/almacenados para la función activa
  // Asientos ocupados obtenidos desde asientosEstado de la función actual
const occupiedSeats = useMemo(() => {
  if (!currentShowtime || !currentShowtime.asientosEstado) {
    return ['A2']; // Asiento A2 por defecto para coincidir con la pantalla si no hay datos
  }

  // Extraer las claves (ej. "A2") cuyo estado sea 'Ocupado'
  return Object.keys(currentShowtime.asientosEstado).filter(
    (seatKey) => currentShowtime.asientosEstado[seatKey] === 'Ocupado'
  );
}, [currentShowtime]);

  // Alternar selección de asiento
  const handleToggleSeat = (seatCode: string) => {
    if (occupiedSeats.includes(seatCode)) {
      Alert.alert('Asiento Ocupado', 'Este asiento ya ha sido reservado.');
      return;
    }

    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatCode));
    } else {
      setSelectedSeats([...selectedSeats, seatCode]);
    }
  };

  // Cálculo del total a pagar
  const totalPrice = useMemo(() => {
    if (!currentMovie) return 0;
    return selectedSeats.length * currentMovie.precio;
  }, [selectedSeats, currentMovie]);

  // Cancelar / Regresar
  const handleCancel = () => {
    navigation.goBack();
  };

  // Confirmar Compra
// Confirmar Compra
const handlePurchase = () => {
  if (!selectedMovieId || !currentMovie) {
    Alert.alert('Error', 'Selecciona una película válida.');
    return;
  }
  if (!selectedShowtimeId || !currentShowtime) {
    Alert.alert('Error', 'Selecciona una función.');
    return;
  }
  if (selectedSeats.length === 0) {
    Alert.alert('Atención', 'Debes seleccionar al menos un asiento.');
    return;
  }

  const generatedTicketId = Date.now().toString();

  // Objeto con la estructura EXACTA del tipo Boleto en index.ts
  const newTicket: Boleto = {
    id: generatedTicketId,
    idPelicula: currentMovie.id,
    idFuncion: currentShowtime.id,
    idSala: currentShowtime.idSala,
    asientosSeleccionados: selectedSeats,
    fechaHoraFuncion: currentShowtime.fechaHora,
    totalPagado: totalPrice,
    fechaCompra: new Date().toISOString(),
    codigoQR: {
      id: `qr-${generatedTicketId}`,
      idBoleto: generatedTicketId,
      token: `TOKEN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      estado: 'NO_ESCANEADO',
    },
  };

  // Despachar a Redux
  dispatch(addTicket(newTicket));

  Alert.alert(
    '¡Compra Exitosa!',
    `Has comprado ${selectedSeats.length} boleto(s) para "${currentMovie.nombre}".\nTotal: $${totalPrice.toFixed(2)}`,
    [
      {
        text: 'Ver Mis Boletos',
        onPress: () => navigation.navigate('MyTickets'),
      },
    ]
  );
};

  return (
    <LinearGradient colors={['#2B2E3A', '#0E0E19']} style={styles.gradientContainer}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#2B2E3A" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Encabezado con línea estilizada */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Boletos</Text>
            <View style={styles.headerLine} />
          </View>

          {/* Tarjeta Oscura estilo Modal Fijo */}
          <View style={styles.formCard}>
            {/* Campo Película */}
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Película:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedMovieId}
                  onValueChange={(itemValue) => {
                    setSelectedMovieId(itemValue);
                    setSelectedSeats([]);
                  }}
                  dropdownIconColor="#9BA0EF"
                  style={styles.picker}
                >
                  {movies.map((m: Pelicula) => (
                    <Picker.Item key={m.id} label={m.nombre} value={m.id} color="#0E1523" />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Campo Función */}
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Función:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedShowtimeId}
                  onValueChange={(itemValue) => {
                    setSelectedShowtimeId(itemValue);
                    setSelectedSeats([]);
                  }}
                  dropdownIconColor="#9BA0EF"
                  style={styles.picker}
                >
                  {availableShowtimes.length === 0 ? (
                    <Picker.Item label="Sin funciones" value="" color="#0E1523" />
                  ) : (
                    availableShowtimes.map((st: Funcion) => (
                      <Picker.Item
                        key={st.id}
                        label={`${st.fechaHora} - ${st.idSala}`}
                        value={st.id}
                        color="#0E1523"
                      />
                    ))
                  )}
                </Picker>
              </View>
            </View>

            {/* Asientos */}
            <Text style={[styles.label, styles.asientosLabel]}>Asientos:</Text>

            <View style={styles.gridContainer}>
              {ROWS.map((row) => (
                <View key={row} style={styles.gridRow}>
                  {COLS.map((col) => {
                    const seatCode = `${row}${col}`;
                    const isOccupied = occupiedSeats.includes(seatCode);
                    const isSelected = selectedSeats.includes(seatCode);

                    return (
                      <TouchableOpacity
                        key={seatCode}
                        activeOpacity={0.7}
                        style={[
                          styles.seatPill,
                          isOccupied && styles.seatOccupied,
                          isSelected && styles.seatSelected,
                        ]}
                        onPress={() => handleToggleSeat(seatCode)}
                      >
                        <Text style={styles.seatText}>{seatCode}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Resumen de Cantidad y Total */}
            <View style={styles.infoRow}>
              <Text style={styles.label}># Asientos:</Text>
              <View style={styles.displayBox}>
                <Text style={styles.displayText}>{selectedSeats.length}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Total a pagar:</Text>
              <View style={styles.displayBox}>
                <Text style={styles.displayText}>
                  ${totalPrice.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Fila de Botones: Cancelar (X) y Comprar */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.btnRojoCircularX} onPress={handleCancel}>
                <Text style={styles.btnRojoText}>x</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.transparentGlowBtn} onPress={handlePurchase}>
                <Text style={styles.transparentGlowText}>Comprar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Barra de Navegación Inferior Flotante */}
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity
            style={styles.navButtonActive}
            onPress={() => navigation.navigate('UserHome')}
          >
            <Image
              source={require('../../../assets/icons/Home.png')}
              style={styles.bottomNavIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('MyTickets')}
          >
            <Image
              source={require('../../../assets/icons/MisBoletos.png')}
              style={styles.bottomNavIcon}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 120, // Espacio suficiente para no chocar con el bottomNavContainer
  },
  // Encabezado
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    color: '#F4B600', // Amarillo de títulos
    fontSize: 26,
    fontWeight: 'bold',
    marginRight: 15,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(244, 182, 0, 0.4)',
  },
  // Tarjeta contenedora principal (Modal Look)
  formCard: {
    backgroundColor: '#181A24',
    borderRadius: 24,
    padding: 20,
    borderColor: 'rgba(251, 254, 255, 0.08)',
    borderWidth: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    color: '#9BA0EF', // Texto Morado
    fontSize: 16,
    fontWeight: '500',
  },
  asientosLabel: {
    marginTop: 5,
    marginBottom: 10,
  },
  pickerWrapper: {
    width: '65%',
    backgroundColor: '#9BA0EF', // Morado suave como la captura
    borderRadius: 20,
    overflow: 'hidden',
    height: 40,
    justifyContent: 'center',
  },
  picker: {
    color: '#000000',
    width: '100%',
  },
  // Matriz de Asientos
  gridContainer: {
    backgroundColor: '#12141D',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  seatPill: {
    width: 38,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#9BA0EF', // Estado Disponible
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatOccupied: {
    backgroundColor: '#D90429', // Estado Ocupado (Rojo)
  },
  seatSelected: {
    backgroundColor: '#2ECC71', // Estado Seleccionado (Verde)
  },
  seatText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Filas de Resumen
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  displayBox: {
    width: '50%',
    backgroundColor: '#222533',
    borderRadius: 15,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderColor: 'rgba(251, 254, 255, 0.1)',
    borderWidth: 1,
  },
  displayText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Fila de Botones
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    marginTop: 15,
  },
  btnRojoCircularX: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D90429',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnRojoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2,
  },
  transparentGlowBtn: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(251, 254, 255, 0.20)',
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3E3E6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 6,
  },
  transparentGlowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Barra de Navegación Inferior Flotante
  bottomNavContainer: {
    position: 'absolute',
    bottom: 45, // Elevación para despegar del borde inferior del sistema
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
});

export default TicketPurchaseScreen;