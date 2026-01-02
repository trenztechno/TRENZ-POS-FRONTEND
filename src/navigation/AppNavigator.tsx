import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';

// Existing screens
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import BusinessSetupScreen1 from '../screens/BusinessSetupStep1';
import BusinessSetupScreen2 from '../screens/BusinessSetupStep2';
import BusinessSetupScreen3 from '../screens/BusinessSetupStep3';
import CreatingBusinessScreen from '../screens/CreatingBusinessScreen';
import SetupSuccessScreen from '../screens/SuccessScreen';
import SetupFailureScreen from '../screens/FailureScreen';
import ModeSelectionScreen from '../screens/ModeSelectionScreen';
import JoinBusinessScreen from '../screens/JoinBusinessScreen';

// Billing screens
import BillingScreen from '../screens/BillingScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import BillSuccessScreen from '../screens/BillSuccessScreen';

// Admin screens
import AdminPinScreen from '../screens/AdminPinScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ItemManagementScreen from '../screens/ItemManagementScreen';
import AddEditItemScreen from '../screens/AddEditItemScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* Existing screens */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="BusinessSetup1"
        component={BusinessSetupScreen1}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="BusinessSetupStep2"
        component={BusinessSetupScreen2}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="BusinessSetupStep3"
        component={BusinessSetupScreen3}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CreatingBusiness"
        component={CreatingBusinessScreen}
      />
      <Stack.Screen
        name="SetupSuccess"
        component={SetupSuccessScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="SetupFailure"
        component={SetupFailureScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="ModeSelection"
        component={ModeSelectionScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="JoinBusiness"
        component={JoinBusinessScreen}
        options={{ animation: 'slide_from_bottom', animationDuration: 300 }}
      />

      {/* Billing screens */}
      <Stack.Screen
        name="Billing"
        component={BillingScreen}
        options={{ animation: 'slide_from_right', animationDuration: 300 }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ animation: 'slide_from_right', animationDuration: 300 }}
      />
      <Stack.Screen
        name="BillSuccess"
        component={BillSuccessScreen}
        options={{ animation: 'fade', gestureEnabled: false }}
      />

      {/* Admin screens */}
      <Stack.Screen
        name="AdminPin"
        component={AdminPinScreen}
        options={{ animation: 'slide_from_right', animationDuration: 300 }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ animation: 'fade', animationDuration: 300 }}
      />
      <Stack.Screen
        name="ItemManagement"
        component={ItemManagementScreen}
        options={{ animation: 'slide_from_right', animationDuration: 300 }}
      />
      <Stack.Screen
        name="AddEditItem"
        component={AddEditItemScreen}
        options={{ animation: 'slide_from_bottom', animationDuration: 300 }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;