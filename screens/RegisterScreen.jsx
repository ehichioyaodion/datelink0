import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { register } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.fullName.trim()) {
      showError('Please enter your full name');
      return false;
    }

    if (!formData.email.trim()) {
      showError('Please enter your email');
      return false;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const trimmedEmail = formData.email.replace(/\s/g, '');
    if (!emailRegex.test(trimmedEmail)) {
      showError('Please enter a valid email address');
      return false;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    
    if (!formData.password) {
      showError('Password is required');
      return false;
    }

    if (formData.password.length < 8) {
      showError('Password must be at least 8 characters long');
      return false;
    }

    if (!passwordRegex.test(formData.password)) {
      let errorMessage = 'Password must contain:';
      if (!/(?=.*[a-z])/.test(formData.password)) errorMessage += '\n- At least one lowercase letter';
      if (!/(?=.*[A-Z])/.test(formData.password)) errorMessage += '\n- At least one uppercase letter';
      if (!/(?=.*\d)/.test(formData.password)) errorMessage += '\n- At least one number';
      if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) errorMessage += '\n- At least one special character';
      
      showError(errorMessage);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      console.log('Starting registration process...');

      const userData = {
        displayName: formData.fullName,
        email: formData.email.toLowerCase().trim(),
      };

      console.log('Attempting registration with:', { email: userData.email });

      const registeredUser = await register(
        formData.email.toLowerCase().trim(),
        formData.password,
        userData
      );

      console.log('Registration successful, user ID:', registeredUser.uid);
      showSuccess('Account created successfully!');

      // Simply navigate to main screen
      // remind me number 1
      navigation.reset({
        index: 0,
        routes: [{ name: 'TabNavigator' }],
      });
    } catch (error) {
      console.error('Registration error:', error);

      let errorMessage = 'An unexpected error occurred';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        default:
          errorMessage = error.message || 'Failed to create account. Please try again';
      }
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView className="flex-1" bounces={false} showsVerticalScrollIndicator={false}>
          {/* Form Fields */}
          <View className="px-4 pt-8">
            <Text className="text-center text-3xl font-bold text-gray-900">Create Account</Text>
            <Text className="mt-2 text-center text-lg text-gray-600">Join our community</Text>

            <View className="mt-8 space-y-4">
              {/* Full Name Input */}
              <View>
                <Text className="mb-2 text-base text-gray-700">Full Name</Text>
                <TextInput
                  className="rounded-xl bg-gray-100 p-4 text-gray-900"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChangeText={(value) => handleChange('fullName', value)}
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                />
              </View>

              {/* Email Input */}
              <View>
                <Text className="mb-2 text-base text-gray-700">Email</Text>
                <TextInput
                  className="rounded-xl bg-gray-100 p-4 text-gray-900"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value.trim())}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  spellCheck={false}
                />
              </View>

              {/* Password Input */}
              <View>
                <Text className="mb-2 text-base text-gray-700">Password</Text>
                <TextInput
                  className="rounded-xl bg-gray-100 p-4 text-gray-900"
                  placeholder="Create a password (min. 8 characters)"
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value.replace(/\s/g, ''))}
                  secureTextEntry
                  autoComplete="password-new"
                  textContentType="newPassword"
                />
                <Text className="mt-1 text-xs text-gray-500">
                  Must contain uppercase, lowercase, number, and special character
                </Text>
              </View>

              {/* Confirm Password Input */}
              <View>
                <Text className="mb-2 text-base text-gray-700">Confirm Password</Text>
                <TextInput
                  className="rounded-xl bg-gray-100 p-4 text-gray-900"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleChange('confirmPassword', value)}
                  secureTextEntry
                  autoComplete="password-new"
                  textContentType="newPassword"
                />
              </View>
            </View>

            {/* Register Button */}
            <View className="mb-4 mt-8">
              <TouchableOpacity
                className={`rounded-full ${loading ? 'bg-gray-400' : 'bg-colorBlue'} py-4`}
                onPress={handleRegister}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-center text-lg font-semibold text-white">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="mb-8 mt-6 flex-row justify-center">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="font-semibold text-colorBlue">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;


