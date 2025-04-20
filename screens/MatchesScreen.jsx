import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import {
  Squares2X2Icon,
  ListBulletIcon,
  ChatBubbleLeftRightIcon,
} from 'react-native-heroicons/solid';

import { FIREBASE_DB, MATCHES_REF, USERS_REF } from '../FirebaseConfig';
import { useAuth } from '../context/AuthContext';

const MatchesScreen = () => {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const matchesQuery = query(
      collection(FIREBASE_DB, MATCHES_REF),
      where('users', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(matchesQuery, async (snapshot) => {
      const matchesData = [];

      for (const doc of snapshot.docs) {
        const matchData = doc.data();
        const otherUserId = matchData.users.find((id) => id !== user.uid);

        // Get other user's profile data
        const userDoc = await getDoc(doc(FIREBASE_DB, USERS_REF, otherUserId));
        const userData = userDoc.data();

        matchesData.push({
          id: doc.id,
          ...matchData,
          name: userData.name,
          age: userData.age,
          image: userData.photoURL,
          lastActive: userData.lastActive || null,
          isOnline: userData.isOnline || false,
          matchDate: matchData.createdAt,
        });
      }

      setMatches(matchesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const GridItem = ({ match }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ChatRoom', { matchId: match.id })}
      className="mb-4 w-full overflow-hidden rounded-2xl bg-white shadow-sm md:w-[48%] lg:w-[31%]">
      <View className="relative">
        <Image source={{ uri: match.image }} className="h-48 w-full" resizeMode="cover" />
        {match.isOnline && (
          <View className="absolute right-2 top-2 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
        )}
      </View>
      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-gray-900">
            {match.name}, {match.age}
          </Text>
        </View>
        <Text className="mt-1 text-sm text-gray-500">Matched {match.matchDate}</Text>
      </View>
    </TouchableOpacity>
  );

  const ListItem = ({ match }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ChatRoom', { matchId: match.id })}
      className="mb-2 flex-row items-center rounded-xl bg-white p-4 shadow-sm">
      <View className="relative">
        <Image source={{ uri: match.image }} className="h-16 w-16 rounded-full" />
        {match.isOnline && (
          <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
        )}
      </View>
      <View className="ml-4 flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-gray-900">
            {match.name}, {match.age}
          </Text>
          <Text className="text-sm text-gray-500">{match.lastActive}</Text>
        </View>
        <Text className="mt-1 text-sm text-gray-500">Matched {match.matchDate}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white md:bg-gray-50">
      <View className="flex-row items-center justify-between bg-white px-4 py-3">
        <Text className="text-2xl font-bold text-gray-900">Matches</Text>
      </View>

      <View className="flex-row items-center justify-between bg-white px-4 py-2">
        <Text className="text-base text-gray-600">{matches.length} matches</Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => setViewMode('grid')}
            className={`rounded-lg p-2 ${viewMode === 'grid' ? 'bg-purple-100' : 'bg-gray-100'}`}>
            <Squares2X2Icon size={20} color={viewMode === 'grid' ? '#8B5CF6' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`rounded-lg p-2 ${viewMode === 'list' ? 'bg-purple-100' : 'bg-gray-100'}`}>
            <ListBulletIcon size={20} color={viewMode === 'list' ? '#8B5CF6' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'grid' ? (
        <ScrollView className="flex-1 md:px-4">
          <View className="flex-row flex-wrap justify-between p-4">
            {matches.map((match) => (
              <GridItem key={match.id} match={match} />
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 md:px-4">
          <View className="space-y-2 p-4">
            {matches.map((match) => (
              <ListItem key={match.id} match={match} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default MatchesScreen;
