// Messenger.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  StatusBar,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Search, Edit2, Circle } from 'react-native-feather';
import Navbar from './Navbar'; // Ensure Navbar.js exists in the same directory

export default function Messenger() {
  const navigation = useNavigation();
  const [chats, setChats] = useState([
    {
      id: '1',
      name: 'John Doe',
      lastMessage: "Hey, how's the recipe going?",
      time: '2m',
      unread: true,
      avatar: 'https://via.placeholder.com/48',
    },
    {
      id: '2',
      name: 'Jane Smith',
      lastMessage: 'The cake turned out great!',
      time: '1h',
      unread: false,
      avatar: 'https://via.placeholder.com/48',
    },
    {
      id: '3',
      name: 'Cooking Club',
      lastMessage: 'Next meeting is on Friday',
      time: '3h',
      unread: true,
      avatar: 'https://via.placeholder.com/48',
    },
    {
      id: '4',
      name: 'Mike Johnson',
      lastMessage: 'Can you share that pasta recipe?',
      time: '1d',
      unread: false,
      avatar: 'https://via.placeholder.com/48',
    },
    // Add more chat objects as needed
  ]);

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatScreen', { chatName: item.name, avatar: item.avatar })}
      accessibilityLabel={`Chat with ${item.name}`}
      accessibilityHint={`Opens chat with ${item.name}`}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      {item.unread && (
        <View style={styles.unreadIndicator}>
          <Circle fill="#0EA5E9" stroke="#0EA5E9" width={8} height={8} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false} // Ensures the status bar does not overlay the content
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go Back"
          accessibilityHint="Navigates back to the previous screen"
        >
          <ChevronLeft stroke="#0EA5E9" width={24} height={24} />
          <Text style={styles.headerButtonText}></Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            // Handle compose message action (e.g., navigate to Compose screen)
            // For example: navigation.navigate('ComposeMessage')
          }}
          accessibilityLabel="Compose Message"
          accessibilityHint="Opens the compose message screen"
        >
          <Edit2 stroke="#0EA5E9" width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search stroke="#9CA3AF" width={16} height={16} />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#6B7280"
            style={styles.searchInput}
            // Add value and onChangeText if implementing search functionality
          />
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
      />

      {/* New Message Button */}
      <TouchableOpacity
        style={styles.newMessageButton}
        onPress={() => {
          // Handle new message action (e.g., navigate to SelectContact screen)
          // For example: navigation.navigate('SelectContact')
        }}
        accessibilityLabel="New Message"
        accessibilityHint="Starts a new message"
      >
        <Text style={styles.newMessageButtonText}>New Message</Text>
      </TouchableOpacity>

      {/* Navbar */}
      <Navbar currentScreen="Search" />
    </View>
  );
}

// Styles
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Match the header's background color
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight, // Increased paddingTop for iOS
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#0EA5E9',
    fontSize: 16,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1, // Allows the title to be centered
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  searchBar: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#1F2937',
    marginLeft: 8,
  },
  chatList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 100, // Increased to ensure content is not hidden behind the navbar and "New Message" button
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  chatTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  chatMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  unreadIndicator: {
    marginLeft: 8,
  },
  newMessageButton: {
    position: 'absolute',
    bottom: 80, // Positioned above the navbar (assuming navbar height ~60)
    right: 20,
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  newMessageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});