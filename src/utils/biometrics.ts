import * as LocalAuthentication from 'expo-local-authentication';

export const authenticateStaff = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    throw new Error('El dispositivo no cuenta con biometría configurada.');
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Autenticación de Staff',
    fallbackLabel: 'Usar código',
    disableDeviceFallback: false,
  });

  return result.success;
};