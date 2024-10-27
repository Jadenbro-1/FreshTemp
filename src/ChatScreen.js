// ChatScreen.js

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  StatusBar,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Video, Send } from 'react-native-feather';

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatName, avatar } = route.params; // Get chat details from navigation
  const [messages, setMessages] = useState([
    { id: '1', content: "Hey! How's your cooking going?", sender: 'other', timestamp: '10:30 AM' },
    { id: '2', content: "It's going great! I just tried that new recipe you shared.", sender: 'user', timestamp: '10:32 AM' },
    { id: '3', content: "That's awesome! How did it turn out?", sender: 'other', timestamp: '10:33 AM' },
    { id: '4', content: "It was delicious! The family loved it.", sender: 'user', timestamp: '10:35 AM' },
    { id: '5', content: "I'm so glad to hear that! Any modifications you'd suggest?", sender: 'other', timestamp: '10:36 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: Date.now().toString(),
        content: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessage : styles.otherMessage,
      ]}
    >
      {item.sender === 'other' && (
        <Image source={{ uri: avatar }} style={styles.messageAvatar} />
      )}
      <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.otherBubble]}>
        <Text
          style={[
            styles.messageText,
            item.sender === 'user' ? styles.userMessageText : styles.otherMessageText,
          ]}
        >
          {item.content}
        </Text>
        <Text style={styles.timestampText}>{item.timestamp}</Text>
      </View>
      {item.sender === 'user' && (
        <Image source={{ uri: avatar }} style={styles.messageAvatar} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Status Bar */}
        <StatusBar
          backgroundColor="#FFFFFF"
          barStyle="dark-content"
          translucent={false}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go Back"
            accessibilityHint="Navigates back to the previous screen"
          >
            <ChevronLeft stroke="#0EA5E9" width={24} height={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <Text style={styles.chatName}>{chatName}</Text>
          </View>
          <TouchableOpacity
            style={styles.headerRight}
            onPress={() => {
              // Handle video call action
              // Example: navigation.navigate('VideoCall', { chatName, avatar })
            }}
            accessibilityLabel="Video Call"
            accessibilityHint="Starts a video call"
          >
            <Video stroke="#0EA5E9" width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          inverted={false} // Ensure messages start from top
        />

        {/* Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#6B7280"
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
              accessible
              accessibilityLabel="Message Input"
              accessibilityHint="Type your message here"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              accessibilityLabel="Send Message"
              accessibilityHint="Sends the typed message"
            >
              <Send stroke="#FFFFFF" width={20} height={20} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

// Styles
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Match the Messenger's background color
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Ensures the center section takes up available space
    justifyContent: 'center',
  },
  headerRight: {
    paddingLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    maxWidth: SCREEN_WIDTH - 150, // Adjust based on available space
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 80, // Ensure content is not hidden behind the input
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E5E7EB', // Default for 'other' messages
  },
  userBubble: {
    backgroundColor: '#0EA5E9', // Blue for user messages
  },
  otherBubble: {
    backgroundColor: '#E5E7EB', // Light gray for other messages
  },
  userMessageText: {
    color: '#FFFFFF', // White text for better visibility on blue background
  },
  otherMessageText: {
    color: '#1F2937', // Dark text for other messages
  },
  messageText: {
    fontSize: 16,
  },
  timestampText: {
    fontSize: 10,
    color: '#6B7280',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#0EA5E9',
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});