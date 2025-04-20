import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { useAuth } from '../context/AuthContext';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { attemptAutoLogin } = useAuth();
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1);

    const checkAuthAndNavigate = async () => {
      try {
        console.log('Starting auth check...'); // Debug log

        // Add timeout handling
        const loginPromise = attemptAutoLogin();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Login timeout')), 5000)
        );

        // Wait for animation
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Race between login attempt and timeout
        const isAutoLoginSuccessful = await Promise.race([loginPromise, timeoutPromise]);
        console.log('Auth check result:', isAutoLoginSuccessful); // Debug log

        if (isAutoLoginSuccessful) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'TabNavigator' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          });
        }
      } catch (error) {
        console.error('Auto login check failed:', error);
        // Navigate to Onboarding on error
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
      }
    };

    checkAuthAndNavigate();
  }, [navigation, attemptAutoLogin, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center bg-blue-500">
      <Animated.View style={animatedStyle}>
        <View className="items-center">
          <Image
            source={require('../assets/icon.png')}
            className="h-32 w-32"
            resizeMode="contain"
          />
          <Text className="mt-4 text-3xl font-bold text-white">DATELINK</Text>
          <ActivityIndicator size="large" color="#ffffff" className="mt-4" />
        </View>
      </Animated.View>
    </View>
  );
};

export default WelcomeScreen;
