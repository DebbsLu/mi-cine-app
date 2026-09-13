import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';

// Actions
import { validarYMarcarQR } from '../../store/slices/ticketsSlice';

// Tipos
import { Boleto, Pelicula } from '../../types';

interface ScanResultState {
  success: boolean;
  title: string;
  movieName: string;
  seats: string[];
  message: string;
}

export const QRScannerScreen = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultState | null>(null);

  const dispatch = useAppDispatch();

  // Obtener boletos y películas para validar localmente en Redux
  const tickets = useAppSelector((state: RootState) => state.tickets.tickets);
  const movies = useAppSelector((state: RootState) => state.movies.movies);

  if (!permission) return <View style={styles.darkBackground} />;

  if (!permission.granted) {
    return (
      <LinearGradient colors={['#2B2E3A', '#0E0E19']} style={styles.containerCenter}>
        <View style={styles.cardPermission}>
          <Text style={styles.permissionText}>
            Se requieren permisos de cámara para escanear y validar los boletos.
          </Text>
          <TouchableOpacity style={styles.btnGlow} onPress={requestPermission}>
            <Text style={styles.btnGlowText}>Conceder Permiso</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }


  const handleBarCodeScanned = ({ data }: { data: string }) => {
  setScanned(true);

  // 1. Buscar el boleto en Redux
  const targetTicket = tickets.find(
    (t: Boleto) => t.codigoQR && t.codigoQR.token === data
  );

  if (!targetTicket) {
    setScanResult({
      success: false,
      title: 'Boleto Inválido',
      movieName: 'Desconocida',
      seats: [],
      message: 'El código QR escaneado no pertenece a ningún boleto registrado.',
    });
    return;
  }

  const movie = movies.find((m: Pelicula) => m.id === targetTicket.idPelicula);
  const movieName = movie ? movie.nombre : 'Película';

  const totalAsientos = targetTicket.asientosSeleccionados.length;
  const usosActuales = targetTicket.codigoQR.usosActuales || 0;

  // 2. Verificar si ya agotó todos sus accesos
  if (targetTicket.codigoQR.estado === 'ESCANEADO' || usosActuales >= totalAsientos) {
    setScanResult({
      success: false,
      title: 'Boleto Agotado',
      movieName,
      seats: targetTicket.asientosSeleccionados,
      message: `Este boleto ya consumió sus ${totalAsientos} entradas disponibles.`,
    });
    return;
  }

  // 3. Cálculos para el acceso actual y los restantes
  const numeroAccesoActual = usosActuales + 1;
  const accesosRestantes = totalAsientos - numeroAccesoActual;

  // 4. Actualizar el estado en Redux
  dispatch(validarYMarcarQR(data));

  // 5. Configurar el resultado con el número de acceso dinámico
  setScanResult({
    success: true,
    title: '¡Acceso Permitido!',
    movieName,
    seats: targetTicket.asientosSeleccionados,
    message: `Acceso ${numeroAccesoActual} de ${totalAsientos} validado. (${accesosRestantes} entrada(s) restante(s)).`,
  });
};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2B2E3A" />

      {/* Visor de Cámara */}
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Marco de enfoque visual estilo Scanner */}
      {!scanned && (
        <View style={styles.overlayContainer}>
          <Text style={styles.scanInstruction}>Alinea el código QR dentro del marco</Text>
          <View style={styles.qrFocusFrame} />
        </View>
      )}

      {/* Modal / Overlay con resultado del escaneo */}
      {scanned && scanResult && (
        <View style={styles.resultOverlayContainer}>
          <View style={[styles.resultCard, scanResult.success ? styles.borderSuccess : styles.borderError]}>
            <Text style={[styles.resultTitle, scanResult.success ? styles.textSuccess : styles.textError]}>
              {scanResult.title}
            </Text>

            {scanResult.movieName !== 'Desconocida' && (
              <View style={styles.infoGroup}>
                <Text style={styles.label}>Película: <Text style={styles.value}>{scanResult.movieName}</Text></Text>
                <Text style={styles.label}>
                  Asientos ({scanResult.seats.length}):{' '}
                  <Text style={styles.valueHighlight}>{scanResult.seats.join(', ')}</Text>
                </Text>
              </View>
            )}

            <Text style={styles.resultMessage}>{scanResult.message}</Text>

            <TouchableOpacity style={styles.btnGlow} onPress={() => setScanned(false)}>
              <Text style={styles.btnGlowText}>Escanear otro código</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>


           
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E19',
  },
  darkBackground: {
    flex: 1,
    backgroundColor: '#0E0E19',
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardPermission: {
    backgroundColor: 'rgba(245, 245, 245, 0.05)',
    borderColor: 'rgba(251, 254, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    width: '90%',
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
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  // Marco de Enfoque de Cámara
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 14, 25, 0.4)',
  },
  scanInstruction: {
    color: '#9BA0EF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 25,
    backgroundColor: 'rgba(14, 14, 25, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  qrFocusFrame: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: '#F4B600', // Amarillo de marca
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  // Overlay de Resultado
  resultOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 14, 25, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  resultCard: {
    width: '100%',
    backgroundColor: '#181A24',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  borderSuccess: {
    borderColor: '#2ECC71',
  },
  borderError: {
    borderColor: '#D90429',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  textSuccess: {
    color: '#2ECC71',
  },
  textError: {
    color: '#D90429',
  },
  infoGroup: {
    width: '100%',
    backgroundColor: 'rgba(245, 245, 245, 0.05)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 15,
    gap: 6,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  value: {
    color: '#9BA0EF',
    fontWeight: '500',
  },
  valueHighlight: {
    color: '#F4B600',
    fontWeight: 'bold',
  },
  resultMessage: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  btnGlow: {
    backgroundColor: '#0E1523',
    borderColor: 'rgba(251, 254, 255, 0.20)',
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGlowText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default QRScannerScreen;