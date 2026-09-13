import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector } from '../../store/hooks';
import { COLORS } from '../../config/constants';
import { Pelicula, Funcion } from '../../types';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';



export const HomeScreen = ({ navigation }: any) => {
  const movies = useAppSelector((state) => state.movies.movies);
  const showtimes = useAppSelector((state) => state.showtimes.showtimes);

  // Estados de Búsqueda y Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('Todos');
  const [selectedRating, setSelectedRating] = useState<string>('Todas');
  const [selectedRoom, setSelectedRoom] = useState<string>('Todas');

  // Estado Modal Detalles
  const [selectedMovie, setSelectedMovie] = useState<Pelicula | null>(null);

  // Opciones predefinidas para filtros
const FILTER_GENRES = ['Todos', 'Acción', 'Comedia', 'Drama', 'Terror', 'Ciencia Ficción', 'Animación', 'Aventura'];
const FILTER_RATINGS = ['Todas', 'A', 'B', 'B15', 'C', 'R'];
const FILTER_ROOMS = ['Todas', 'Sala 1', 'Sala 2', 'Sala 3', 'Sala VIP', 'Sala IMAX'];

  // Filtrado Dinámico de Películas
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // Solo mostrar películas disponibles
      if (movie.estado !== 'Disponible') return false;

      // Buscar las funciones asociadas a la película para filtrar por sala
      const movieShowtimes = showtimes.filter((st) => st.idPelicula === movie.id);
      const matchesRoom =
        selectedRoom === 'Todas' || movieShowtimes.some((st) => st.idSala === selectedRoom);

      // Búsqueda por Texto (Nombre, Género o Clasificación)
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        query === '' ||
        movie.nombre.toLowerCase().includes(query) ||
        movie.genero.toLowerCase().includes(query) ||
        movie.clasificacion.toLowerCase().includes(query) ||
        movieShowtimes.some((st) => st.idSala.toLowerCase().includes(query));

      // Filtros explícitos de la categoría
      const matchesGenre = selectedGenre === 'Todos' || movie.genero === selectedGenre;
      const matchesRating = selectedRating === 'Todas' || movie.clasificacion === selectedRating;

      return matchesQuery && matchesGenre && matchesRating && matchesRoom;
    });
  }, [movies, showtimes, searchQuery, selectedGenre, selectedRating, selectedRoom]);

  const resetFilters = () => {
    setSelectedGenre('Todos');
    setSelectedRating('Todas');
    setSelectedRoom('Todas');
    setShowFilterModal(false);
  };

  return (
    <LinearGradient colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Superior con Botón Discreto de Staff */}
            <View style={styles.staffHeaderContainer}>
              <TouchableOpacity
                style={styles.staffHeaderBtn}
                onPress={() => navigation.navigate('StaffLogin')}
              >
                <Image
                  source={require('../../../assets/icons/StaffBtnAcceder.png')}
                  style={styles.staffBtnIcon}
                />
              </TouchableOpacity>
            </View>

          {/* Título de Bienvenida */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.welcomeTitle}>¡Hello, User!</Text>
            <View style={styles.titleLine} />
          </View>
          <Text style={styles.welcomeSubtitle}>Encuentra tu película acá</Text>

          {/* Barra de Búsqueda Dinámica */}
          <View style={styles.searchBarContainer}>
            <View style={styles.searchInputRow}>
              <Image
                source={require('../../../assets/icons/search (1).png')}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Busca o filtra tu película"
                placeholderTextColor={COLORS.textPurple}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity onPress={() => setShowFilterModal(true)}>
                <Image
                  source={require('../../../assets/icons/Filtros.png')}
                  style={styles.filterIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Sugerencias Rápidas Dinámicas */}
            {searchQuery.length > 0 && (
              <View style={styles.suggestionsList}>
                {filteredMovies.slice(0, 3).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setSelectedMovie(item);
                      setSearchQuery('');
                    }}
                  >
                    <Text style={styles.suggestionText}>{item.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Listado de Películas */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Películas</Text>
            <View style={styles.titleLine} />
          </View>

          {filteredMovies.map((movie) => (
            <View key={movie.id} style={styles.movieCard}>
              <View style={styles.movieHeaderRow}>
                <View style={styles.movieTitlePill}>
                  <Text style={styles.movieTitleText}>{movie.nombre}</Text>
                </View>
                <TouchableOpacity
                  style={styles.btnMasOpciones}
                  onPress={() => setSelectedMovie(movie)}
                >
                  <Image
                    source={require('../../../assets/icons/Detalles.png')}
                    style={styles.detailsIcon}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.movieDetailsContainer}>
                <Text style={styles.detailText}>
                  Género: <Text style={styles.detailValue}>{movie.genero}</Text>
                </Text>
                <Text style={styles.detailText}>
                  Clasificación: <Text style={styles.detailValue}>{movie.clasificacion}</Text>
                </Text>
                <Text style={styles.detailText}>
                  Precio: <Text style={styles.detailValue}>${movie.precio.toFixed(2)}</Text>
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Modal de Detalles de la Película */}
        <Modal visible={selectedMovie !== null} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Detalle de Película</Text>
                <TouchableOpacity
                  style={styles.btnRojoCircularX}
                  onPress={() => setSelectedMovie(null)}
                >
                  <Text style={styles.btnRojoText}>X</Text>
                </TouchableOpacity>
              </View>

              {selectedMovie && (
                <View style={styles.modalBody}>
                  <Text style={styles.modalMovieName}>{selectedMovie.nombre}</Text>
                  <Text style={styles.modalDetailText}>
                    Género: <Text style={styles.detailValue}>{selectedMovie.genero}</Text>
                  </Text>
                  <Text style={styles.modalDetailText}>
                    Duración: <Text style={styles.detailValue}>{selectedMovie.duracion} min</Text>
                  </Text>
                  <Text style={styles.modalDetailText}>
                    Clasificación: <Text style={styles.detailValue}>{selectedMovie.clasificacion}</Text>
                  </Text>
                  <Text style={styles.modalDetailText}>
                    Estado: <Text style={styles.detailValue}>{selectedMovie.estado}</Text>
                  </Text>
                  <Text style={styles.modalDetailText}>
                    Precio: <Text style={styles.detailValue}>${selectedMovie.precio.toFixed(2)}</Text>
                  </Text>

                  <TouchableOpacity
                    style={styles.blueGlowButton}
                    onPress={() => {
                      const movieToBuy = selectedMovie;
                      setSelectedMovie(null);
                      navigation.navigate('TicketPurchase', { movie: movieToBuy });
                    }}
                  >
                    <Text style={styles.blueGlowText}>Comprar boleto</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Modal para Filtros de Categoría */}
{/* Modal para Filtros de Categoría */}
<Modal visible={showFilterModal} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Filtrar Películas</Text>
        <TouchableOpacity
          style={styles.btnRojoCircularX}
          onPress={() => setShowFilterModal(false)}
        >
          <Text style={styles.btnRojoText}>X</Text>
        </TouchableOpacity>
      </View>

      {/* Sección Género */}
      <Text style={styles.filterSectionLabel}>Género:</Text>
      <View style={styles.filterOptionsRow}>
        {FILTER_GENRES.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, selectedGenre === g && styles.chipActive]}
            onPress={() => setSelectedGenre(g)}
          >
            <Text style={styles.chipText}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sección Clasificación */}
      <Text style={styles.filterSectionLabel}>Clasificación:</Text>
      <View style={styles.filterOptionsRow}>
        {FILTER_RATINGS.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, selectedRating === r && styles.chipActive]}
            onPress={() => setSelectedRating(r)}
          >
            <Text style={styles.chipText}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sección Sala */}
      <Text style={styles.filterSectionLabel}>Sala:</Text>
      <View style={styles.filterOptionsRow}>
        {FILTER_ROOMS.map((room) => (
          <TouchableOpacity
            key={room}
            style={[styles.chip, selectedRoom === room && styles.chipActive]}
            onPress={() => setSelectedRoom(room)}
          >
            <Text style={styles.chipText}>{room}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btnAzulGlow} onPress={resetFilters}>
        <Text style={styles.btnAzulText}>Limpiar Filtros</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

        {/* Barra de Navegación Inferior */}
        <View style={styles.bottomNavContainer}>
        <TouchableOpacity style={styles.navButtonActive}>
            <Image
            source={require('../../assets/icons/Home.png')}
            style={styles.bottomNavIcon}
            />
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('MyTickets')}
        >
            <Image
            source={require('../../assets/icons/MisBoletos.png')}
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  topHeaderContainer: { paddingTop: 10, alignItems: 'flex-start' },
  btnMenuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderColor: 'rgba(251, 254, 255, 0.20)',
    borderWidth: 1,
    
    alignItems: 'center',
    shadowColor: '#3E3E6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: 'rgba(245, 245, 245, 0.05)',
  },
  staffHeaderContainer: {
  paddingTop: 30, // Añade espacio para despegarlo de la barra superior del teléfono
  alignItems: 'flex-start',
},
staffHeaderBtn: {
  width: 75, // Ancho para darle forma rectangular
  height: 36, // Altura
  borderRadius: 10, // Bordes suavemente redondeados (no circular)
  borderColor: 'rgba(251, 254, 255, 0.20)',
  borderWidth: 1,
  justifyContent: 'center', // Centra el icono verticalmente
  alignItems: 'center', // Centra el icono horizontalmente
  backgroundColor: 'rgba(245, 245, 245, 0.05)',
  shadowColor: '#3E3E6B',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  shadowRadius: 6,
  elevation: 4,
},
  btnMenuText: { color: COLORS.textWhite, fontSize: 12, fontWeight: 'bold' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  welcomeTitle: { color: COLORS.titleYellow, fontSize: 26, fontWeight: 'bold', marginRight: 10 },
  welcomeSubtitle: { color: COLORS.titleYellow, fontSize: 14, marginTop: 4, marginBottom: 15 },
  titleLine: { flex: 1, height: 1, backgroundColor: COLORS.titleYellow },
  searchBarContainer: {
    backgroundColor: 'rgba(245, 245, 245, 0.05)',
    borderColor: 'rgba(251, 254, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInputRow: { flexDirection: 'row', alignItems: 'center' },
  searchIcon: { width: 18, height: 18, tintColor: COLORS.textPurple, marginRight: 10 },
  filterIcon: { width: 18, height: 18, tintColor: COLORS.textWhite, marginLeft: 10 },
  searchInput: { flex: 1, color: COLORS.textWhite, fontSize: 14, paddingVertical: 0 },
  suggestionsList: { marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(251, 254, 255, 0.1)', paddingTop: 8 },
  suggestionText: { color: COLORS.textWhite, paddingVertical: 4, fontSize: 13 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: COLORS.titleYellow, fontSize: 22, fontWeight: 'bold', marginRight: 10 },
  movieCard: {
    backgroundColor: 'rgba(245, 245, 245, 0.05)',
    borderColor: 'rgba(251, 254, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 25,
    padding: 16,
    marginBottom: 15,
  },
  movieHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  movieTitlePill: {
    backgroundColor: 'rgba(245, 245, 245, 0.08)',
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flex: 1,
    marginRight: 10,
  },
  movieTitleText: { color: COLORS.textWhite, fontSize: 15, fontWeight: '600' },
  btnMasOpciones: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsIcon: { width: 16, height: 16, resizeMode: 'contain' },
  movieDetailsContainer: { gap: 4, paddingLeft: 5 },
  detailText: { color: COLORS.textPurple, fontSize: 14 },
  detailValue: { color: COLORS.textWhite, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', paddingHorizontal: 20 },
  modalCard: {
    backgroundColor: COLORS.bgGradientStart,
    borderColor: 'rgba(251, 254, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 25,
    padding: 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { color: COLORS.titleYellow, fontSize: 20, fontWeight: 'bold' },
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
  btnAzulText: { color: COLORS.textWhite, fontSize: 15, fontWeight: '600' },
  filterSectionLabel: { color: COLORS.titleYellow, fontSize: 14, marginTop: 10, marginBottom: 5 },
  filterOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: 'rgba(245, 245, 245, 0.05)',
    borderColor: 'rgba(251, 254, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { borderColor: COLORS.titleYellow, backgroundColor: 'rgba(244, 182, 0, 0.15)' },
  chipText: { color: COLORS.textWhite, fontSize: 12 },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 45, // <-- Aumentamos de 20 a 45 para despegarlo del borde del sistema
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    zIndex: 10, // Para asegurar que quede flotando sobre el ScrollView
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
  navIcon: { fontSize: 20 },
  // Agrega o actualiza estos estilos en tu StyleSheet:
staffBtnIcon: {
  width: 20,
  height: 20,
  resizeMode: 'contain',
},
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
blueGlowText: {
  color: COLORS.textWhite, // O '#FFFFFF'
  fontSize: 15,
  fontWeight: '500',
},
bottomNavIcon: {
  width: 22,
  height: 22,
  resizeMode: 'contain',
},
});