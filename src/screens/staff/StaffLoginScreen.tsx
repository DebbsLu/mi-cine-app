import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAppDispatch } from '../../store/hooks';
import { loginStaff } from '../../store/slices/authSlice';
import { COLORS } from '../../config/constants';

export const StaffLoginScreen = ({ navigation }: any) => {
  const [fingerprintValidated, setFingerprintValidated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  // Escaneo de huella digital con expo-local-authentication
  const handleFingerprintScan = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // En simuladores o dispositivos sin huella, se aprueba la validación
        setFingerprintValidated(true);
        setErrorMessage(null);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Coloca tu huella en el sensor',
        fallbackLabel: 'Usar PIN',
      });

      if (result.success) {
        setFingerprintValidated(true);
        setErrorMessage(null);
      } else {
        setFingerprintValidated(false);
        setErrorMessage('Fallo en la autenticación de huella');
      }
    } catch (error) {
      setErrorMessage('Error al acceder al sensor biométrico');
    }
  };

  // Inicio de sesión y navegación hacia Staff Home
  const handleLogin = () => {
    if (fingerprintValidated) {
      dispatch(loginStaff());
      navigation.navigate('StaffHome');
    } else {
      setErrorMessage('Debes validar tu huella antes de iniciar sesión.');
    }
  };

  const handleRetryFingerprint = () => {
    setFingerprintValidated(false);
    handleFingerprintScan();
  };

  return (
    <LinearGradient
      colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          {/* Mensaje Superior */}
          <Text style={styles.instructionText}>
            Presiona el botón de abajo{'\n'}y Coloca tu huella en el sensor.
          </Text>

          {/* Caja Indicadora del Sensor de Huella */}
          <TouchableOpacity
            style={[
              styles.fingerprintBox,
              fingerprintValidated && styles.fingerprintBoxSuccess,
            ]}
            onPress={handleFingerprintScan}
            activeOpacity={0.7}
          />

          {/* Botón "Intenta otra vez" */}
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetryFingerprint}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>
              {fingerprintValidated ? 'Huella lista' : 'Intenta otra vez'}
            </Text>
          </TouchableOpacity>

          {/* Botón Principal: Iniciar Sesión */}
          <TouchableOpacity
            style={styles.loginGlowButton}
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          {/* Mensaje de Error / Estado */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  instructionText: {
    color: COLORS.textWhite,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 35,
    fontWeight: '400',
  },
  fingerprintBox: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: COLORS.placeholderGray,
    marginBottom: 30,
  },
  fingerprintBoxSuccess: {
    backgroundColor: 'rgba(76, 217, 100, 0.25)',
    borderWidth: 1,
    borderColor: '#4CD964',
  },
  retryButton: {
    backgroundColor: COLORS.titleYellow,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 22,
    marginBottom: 30,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  loginGlowButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.btnGlowBorder,
    backgroundColor: 'transparent',
    alignItems: 'center',
    shadowColor: COLORS.btnGlowShadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  loginButtonText: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: '500',
  },
  errorBanner: {
    marginTop: 20,
    width: '100%',
    backgroundColor: COLORS.redAlert,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '500',
  },
});