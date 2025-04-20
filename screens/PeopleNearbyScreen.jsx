import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { MapPinIcon, AdjustmentsVerticalIcon } from 'react-native-heroicons/solid';

const DUMMY_NEARBY_USERS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 25,
    distance: '2 km away',
    image: 'https://example.com/sarah.jpg',
    interests: ['Travel', 'Photography', 'Music'],
    isOnline: true,
  },
  {
    id: '2',
    name: 'James Wilson',
    age: 28,
    distance: '3 km away',
    image: 'https://example.com/james.jpg',
    interests: ['Sports', 'Movies', 'Food'],
    isOnline: false,
  },
  // Add more users
];

const UserCard = ({ user }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Profile', { userId: user.id })}
      className="mr-4 w-64 overflow-hidden rounded-2xl bg-white shadow-sm">
      <Image source={{ uri: user.image }} className="h-48 w-full" resizeMode="cover" />
      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <Text className="text-lg font-semibold text-gray-900">
              {user.name}, {user.age}
            </Text>
            {user.isOnline && <View className="h-2 w-2 rounded-full bg-green-500" />}
          </View>
        </View>
        <View className="mt-1 flex-row items-center">
          <MapPinIcon size={16} color="#6B7280" />
          <Text className="ml-1 text-sm text-gray-500">{user.distance}</Text>
        </View>
        <View className="mt-2 flex-row flex-wrap gap-1">
          {user.interests.map((interest, index) => (
            <View key={index} className="rounded-full bg-purple-100 px-2 py-1">
              <Text className="text-xs text-purple-600">{interest}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PeopleNearbyScreen = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    checkAndRequestLocationPermission();
  }, []);

  const checkAndRequestLocationPermission = async () => {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();

      if (status !== 'granted') {
        status = (await Location.requestForegroundPermissionsAsync()).status;
      }

      if (status === 'granted') {
        await getLocation();
      } else {
        setErrorMsg('Location permission denied');
        showLocationPermissionAlert();
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setErrorMsg('Error accessing location services');
    }
  };

  const getLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(location);
      // Here you would typically make an API call to fetch nearby users
      // using location.coords.latitude and location.coords.longitude
      console.log('Location obtained:', location);
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Error getting location');
    }
  };

  const showLocationPermissionAlert = () => {
    Alert.alert(
      'Location Access Required',
      'DateLink needs access to your location to show you people nearby. Please enable location services in your device settings.',
      [
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const renderLocationError = () => {
    if (!errorMsg) return null;

    return (
      <View className="mx-4 rounded-lg bg-red-100 p-4">
        <Text className="text-center text-red-700">{errorMsg}</Text>
        <TouchableOpacity
          onPress={checkAndRequestLocationPermission}
          className="mt-2 rounded-lg bg-red-500 p-2">
          <Text className="text-center text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between bg-white p-4">
        <Text className="text-2xl font-bold text-gray-900">People Nearby</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <AdjustmentsVerticalIcon size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {renderLocationError()}

      <ScrollView className="flex-1 pt-4">
        <View className="px-4">
          <Text className="mb-4 text-base text-gray-600">People in your area</Text>
          <FlatList
            data={DUMMY_NEARBY_USERS}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <UserCard user={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingRight: 16 }}
          />
        </View>

        <View className="mt-8 px-4">
          <Text className="mb-4 text-base text-gray-600">Recently Active</Text>
          <View className="flex-row flex-wrap justify-between">
            {DUMMY_NEARBY_USERS.map((user) => (
              <TouchableOpacity
                key={user.id}
                onPress={() => navigation.navigate('Profile', { userId: user.id })}
                className="mb-4 w-[48%] overflow-hidden rounded-xl bg-white">
                <Image source={{ uri: user.image }} className="h-48 w-full" resizeMode="cover" />
                <View className="p-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-gray-900">{user.name}</Text>
                    {user.isOnline && <View className="h-2 w-2 rounded-full bg-green-500" />}
                  </View>
                  <Text className="text-sm text-gray-500">{user.distance}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PeopleNearbyScreen;
