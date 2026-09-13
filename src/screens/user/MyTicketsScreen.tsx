import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';

// Tipos centralizados
import { Boleto, Pelicula } from '../../types';

export const MyTicketsScreen = ({ navigation }: any) => {
  // Obtener boletos y películas guardadas en Redux
  const tickets = useAppSelector((state: RootState) => state.tickets.tickets);
  const movies = useAppSelector((state: RootState) => state.movies.movies);

  // Función para obtener el nombre de la película según su ID
  const getMovieName = (idPelicula: string) => {
    const movie = movies.find((m: Pelicula) => m.id === idPelicula);
    return movie ? movie.nombre : 'Avengers: End game'; // Fallback como en la imagen de muestra
  };

  return (
    <LinearGradient colors={['#2B2E3A', '#0E0E19']} style={styles.gradientContainer}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#2B2E3A" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Encabezado: Título "Boletos" con línea decorativa */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Boletos</Text>
            <View style={styles.headerLine} />
          </View>

          {/* Estado sin boletos */}
          {tickets.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No tienes boletos comprados aún.</Text>
            </View>
          ) : (
            /* Lista de Boletos Comprados */
            tickets.map((ticket: Boleto, index: number) => {
              const nombrePelicula = getMovieName(ticket.idPelicula);
              const asientosTexto = ticket.asientosSeleccionados.join(', ');

              return (
                <View key={ticket.id} style={styles.ticketCard}>
                  {/* Encabezado de la Tarjeta con Borde Suave */}
                  <View style={styles.ticketHeaderPill}>
                    <Text style={styles.ticketHeaderTitle}>Boletos {index + 1}</Text>
                  </View>

                  {/* Detalles del Boleto */}
                  <View style={styles.detailsContainer}>
                    <Text style={styles.detailText}>
                      Película:{' '}
                      <Text style={styles.detailValue}>{nombrePelicula}</Text>
                    </Text>

                    <Text style={styles.detailText}>
                      Función:{' '}
                      <Text style={styles.detailValue}>
                        {ticket.fechaHoraFuncion || '12/09-14:30'}-{ticket.idSala || 'Sala 1'}
                      </Text>
                    </Text>

                    <Text style={styles.detailText}>
                      Asientos:{' '}
                      <Text style={styles.detailValue}>{asientosTexto}</Text>
                    </Text>
                  </View>

                  {/* Renderizado de Código QR */}
                  <View style={styles.qrContainer}>
                    {ticket.codigoQR?.token ? (
                      <QRCode
                        value={ticket.codigoQR.token}
                        size={120}
                        color="#9BA0EF"
                        backgroundColor="transparent"
                      />
                    ) : (
                      /* Fallback estético si no hay token generado */
                      <View style={styles.qrFallbackBox}>
                        <Image
                          source={require('../../../assets/icons/MisBoletos.png')}
                          style={styles.qrFallbackIcon}
                        />
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Barra de Navegación Inferior Flotante (Mis Boletos activo) */}
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Image
              source={require('../../../assets/icons/Home.png')}
              style={styles.bottomNavIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButtonActive}
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
    paddingBottom: 120, // Espacio para la barra flotante inferior
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
  // Tarjeta de Boleto estilo Modal/Container
  ticketCard: {
    backgroundColor: 'rgba(245, 245, 245, 0.05)', // #F5F5F5 a 5% opacidad
    borderColor: 'rgba(251, 254, 255, 0.15)', // FBFEFF a 15% opacidad
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: 'rgba(245, 245, 245, 0.05)',
    borderColor: 'rgba(251, 254, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#9BA0EF',
    fontSize: 16,
    textAlign: 'center',
  },
  // Header Capsule interno (Boletos N)
  ticketHeaderPill: {
    width: '100%',
    backgroundColor: 'rgba(245, 245, 245, 0.05)',
    borderColor: 'rgba(251, 254, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  ticketHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Bloque de detalles de la película y función
  detailsContainer: {
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 20,
    gap: 6,
  },
  detailText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
  },
  detailValue: {
    color: '#9BA0EF', // Texto Morado
    fontWeight: '500',
  },
  // Contenedor del código QR
  qrContainer: {
    marginTop: 5,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  qrFallbackBox: {
    width: 130,
    height: 130,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#9BA0EF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrFallbackIcon: {
    width: 60,
    height: 60,
    tintColor: '#9BA0EF',
    resizeMode: 'contain',
  },
  // Barra de Navegación Inferior Flotante
  bottomNavContainer: {
    position: 'absolute',
    bottom: 45, // Despegado del borde del sistema
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

export default MyTicketsScreen;