import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/user/HomeScreen';
import { TicketPurchaseScreen } from '../screens/user/TicketPurchaseScreen';
import { MyTicketsScreen } from '../screens/user/MyTicketsScreen';
import { StaffLoginScreen } from '../screens/staff/StaffLoginScreen';
import { StaffHomeScreen } from '../screens/staff/StaffHomeScreen';
import { QRScannerScreen } from '../screens/staff/QRScannerScreen';

export type RootStackParamList = {
  Home: undefined;
  TicketPurchase: { movie: any };
  MyTickets: undefined;
  StaffLogin: undefined;
  StaffHome: undefined;
  QRScanner: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home" // <- Define HomeScreen como la pantalla por defecto al abrir la app
      screenOptions={{
        headerShown: false, // Oculta la barra superior predeterminada para usar el diseño personalizado
      }}
    >
      {/* Flujo Principal de Usuario */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="TicketPurchase" component={TicketPurchaseScreen} />
      <Stack.Screen name="MyTickets" component={MyTicketsScreen} />

      {/* Flujo de Personal (Staff) */}
      <Stack.Screen name="StaffLogin" component={StaffLoginScreen} />
      <Stack.Screen name="StaffHome" component={StaffHomeScreen} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
    </Stack.Navigator>
  );
};