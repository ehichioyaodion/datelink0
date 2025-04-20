import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
// Fix useAuth import
import { View, ActivityIndicator } from 'react-native';

import TabNavigator from './TabNavigator';
import { useAuth } from '../context/AuthContext';
// Import screens
import AuthScreen from '../screens/AuthScreen';
import BlockedUsersScreen from '../screens/BlockedUsersScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import LoginScreen from '../screens/LoginScreen';
import MatchScreen from '../screens/MatchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  // Add console log for debugging
  console.log('AppNavigator state:', { user, loading });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            {!user.profileCompleted ? (
              <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            ) : (
              <>
                <Stack.Screen name="TabNavigator" component={TabNavigator} />
                <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
                <Stack.Screen name="Match" component={MatchScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
                <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
