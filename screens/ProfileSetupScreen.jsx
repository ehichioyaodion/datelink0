import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftIcon, CameraIcon } from 'react-native-heroicons/solid';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FIREBASE_DB, FIREBASE_STORAGE } from '../FirebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

const ProfileSetupScreen = () => {
  const navigation = useNavigation();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileData, setProfileData] = useState({
    bio: '',
    age: '',
    gender: '',
    location: '',
    interests: [],
    dateOfBirth: new Date().toISOString(),
  });
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const interests = [
    'Music',
    'Travel',
    'Food',
    'Sports',
    'Art',
    'Reading',
    'Movies',
    'Photography',
    'Gaming',
    'Fitness',
  ];

  const handleChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInterestToggle = (interest) => {
    setProfileData((prev) => {
      const currentInterests = [...prev.interests];
      if (currentInterests.includes(interest)) {
        return {
          ...prev,
          interests: currentInterests.filter((i) => i !== interest),
        };
      } else {
        if (currentInterests.length >= 5) {
          Alert.alert('Limit Reached', 'You can select up to 5 interests');
          return prev;
        }
        return {
          ...prev,
          interests: [...currentInterests, interest],
        };
      }
    });
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload a photo');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `profile_${user.uid}_${Date.now()}.jpg`;
      const storageRef = ref(FIREBASE_STORAGE, `profile_images/${filename}`);

      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      throw new Error('Failed to upload image');
    }
  };

  // Calculate age from date of birth
  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
      const age = calculateAge(selectedDate);
      handleChange('age', age.toString());
    }
  };

  // Show date picker
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const validateProfile = () => {
    if (!profileData.bio.trim()) {
      Alert.alert('Error', 'Please write a short bio');
      return false;
    }

    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      Alert.alert('Error', 'You must be at least 18 years old to use this app');
      return false;
    }

    if (age > 100) {
      Alert.alert('Error', 'Please enter a valid date of birth');
      return false;
    }

    if (!profileData.gender) {
      Alert.alert('Error', 'Please select your gender');
      return false;
    }

    if (!profileData.location.trim()) {
      Alert.alert('Error', 'Please enter your location');
      return false;
    }

    if (profileData.interests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return false;
    }

    return true;
  };

  const handleCompleteSetup = async () => {
    if (!validateProfile()) return;

    try {
      setLoading(true);
      console.log('Starting profile setup...'); // Debug log

      let photoURL = null;
      if (profileImage) {
        console.log('Uploading image...'); // Debug log
        photoURL = await uploadImage(profileImage);
        console.log('Image uploaded successfully:', photoURL); // Debug log
      }

      const updatedData = {
        ...profileData,
        dateOfBirth: dateOfBirth.toISOString(),
        age: calculateAge(dateOfBirth),
        photoURL,
        profileCompleted: true,
        updatedAt: new Date().toISOString(),
      };

      console.log('Updating Firestore with data:', updatedData); // Debug log

      // Update Firestore
      const userRef = doc(FIREBASE_DB, 'users', user.uid);
      await updateDoc(userRef, updatedData);

      console.log('Firestore updated successfully'); // Debug log

      // Update Auth Context
      await updateUserProfile({
        ...user,
        ...updatedData,
      });

      console.log('Auth context updated successfully'); // Debug log

      navigation.reset({
        index: 0,
        routes: [{ name: 'TabNavigator' }],
      });
    } catch (error) {
      console.error('Profile setup error:', error); // Detailed error logging
      Alert.alert(
        'Error',
        'Failed to complete profile setup: ' + (error.message || 'Unknown error')
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <View>
          <Text className="mb-2 text-base text-gray-700">Date of Birth</Text>
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="spinner"
            onChange={onDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1923, 0, 1)}
          />
          <Text className="mt-1 text-right text-gray-500">
            Age: {calculateAge(dateOfBirth)}
          </Text>
        </View>
      );
    }

    return (
      <View>
        <Text className="mb-2 text-base text-gray-700">Date of Birth</Text>
        <TouchableOpacity
          onPress={showDatePickerModal}
          className="rounded-xl bg-gray-100 p-4">
          <Text className="text-gray-900">
            {dateOfBirth.toLocaleDateString()} (Age: {calculateAge(dateOfBirth)})
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1923, 0, 1)}
          />
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeftIcon size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        <Text className="text-3xl font-bold text-gray-900">Complete Your Profile</Text>
        <Text className="mt-2 text-lg text-gray-600">Tell us about yourself</Text>

        <View className="mt-8 items-center">
          <TouchableOpacity onPress={pickImage} className="relative">
            <Image
              source={
                profileImage ? { uri: profileImage } : require('../assets/Default-avatar.jpeg')
              }
              className="h-32 w-32 rounded-full"
            />
            <View className="absolute bottom-0 right-0 rounded-full bg-colorBlue p-2">
              <CameraIcon size={20} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="mt-8 space-y-4">
          <View>
            <Text className="mb-2 text-base text-gray-700">Bio</Text>
            <TextInput
              className="rounded-xl bg-gray-100 p-4 text-gray-900"
              placeholder="Write something about yourself..."
              value={profileData.bio}
              onChangeText={(value) => handleChange('bio', value)}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
            <Text className="mt-1 text-right text-gray-500">{profileData.bio.length}/200</Text>
          </View>

          {renderDatePicker()}

          <View>
            <Text className="mb-2 text-base text-gray-700">Gender</Text>
            <View className="flex-row space-x-4">
              {['Male', 'Female', 'Other'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  onPress={() => handleChange('gender', gender)}
                  className={`flex-1 rounded-xl p-4 ${
                    profileData.gender === gender ? 'bg-colorBlue' : 'bg-gray-100'
                  }`}>
                  <Text
                    className={`text-center ${
                      profileData.gender === gender ? 'text-white' : 'text-gray-700'
                    }`}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="mb-2 text-base text-gray-700">Location</Text>
            <TextInput
              className="rounded-xl bg-gray-100 p-4 text-gray-900"
              placeholder="Where are you based?"
              value={profileData.location}
              onChangeText={(value) => handleChange('location', value)}
            />
          </View>

          <View>
            <Text className="mb-2 text-base text-gray-700">Interests (Select up to 5)</Text>
            <View className="flex-row flex-wrap gap-2">
              {interests.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  onPress={() => handleInterestToggle(interest)}
                  className={`rounded-full px-4 py-2 ${
                    profileData.interests.includes(interest) ? 'bg-colorBlue' : 'bg-gray-100'
                  }`}>
                  <Text
                    className={
                      profileData.interests.includes(interest) ? 'text-white' : 'text-gray-700'
                    }>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View className="my-8">
          <TouchableOpacity
            className={`rounded-full ${loading ? 'bg-gray-400' : 'bg-colorBlue'} py-4`}
            onPress={handleCompleteSetup}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-center text-lg font-semibold text-white">Complete Setup</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileSetupScreen;
