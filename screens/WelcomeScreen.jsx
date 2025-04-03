import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
        // Add timeout handling
        const loginPromise = attemptAutoLogin();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Login timeout')), 5000)
        );

        // Wait for animation to complete (minimum 2 seconds instead of 3)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Race between login attempt and timeout
        const isAutoLoginSuccessful = await Promise.race([loginPromise, timeoutPromise]);

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
        // Ensure navigation happens even on error
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
      }
    };

    checkAuthAndNavigate();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center bg-colorBlue">
      <Animated.View style={animatedStyle}>
        <View className="items-center">
          <Image source={require('../assets/icon.png')} className="h-32 w-32" />
          <Text className="mt-4 text-3xl font-bold text-white">DateLink</Text>
          <Text className="mt-2 text-center text-white">
            Connecting people, one match at a time
          </Text>
          <ActivityIndicator size="large" color="#ffffff" className="mt-4" />
        </View>
      </Animated.View>
    </View>
  );
};

export default WelcomeScreen;
