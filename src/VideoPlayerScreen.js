import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Animated, ScrollView } from 'react-native';
import Video from 'react-native-video';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
  const { videoUrl, username, profilePic, description, comments, isFavorite, isSubscribed } = route.params;
  const [showComments, setShowComments] = useState(false);
  const [commentScrollY] = useState(new Animated.Value(0));
  const [isPaused, setIsPaused] = useState(false);

  const toggleComments = () => {
    setShowComments(!showComments);
    Animated.spring(commentScrollY, {
      toValue: showComments ? 0 : -screenHeight / 2,
      useNativeDriver: true,
    }).start();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <View style={styles.background}>
      <TouchableOpacity activeOpacity={1} onPress={togglePause} style={{ flex: 1 }}>
        <Video
          source={{ uri: videoUrl }} // Ensure videoUrl is a string
          style={styles.video}
          resizeMode="cover"
          repeat
          paused={isPaused}
          onError={(error) => console.log(`Error loading video:`, error)}
          onLoadStart={() => console.log(`Loading video: ${videoUrl}`)}
        />
      </TouchableOpacity>
      <View style={styles.overlay}>
        {!showComments && (
          <View style={styles.symbolContainer}>
            <TouchableOpacity>
              <Text style={styles.symbol}>{isFavorite ? '★' : '☆'}</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.symbol}>{isSubscribed ? '⊖' : '⊕'}</Text>
            </TouchableOpacity>
          </View>
        )}
        <Animated.View style={[styles.videoDetailsContainer, showComments ? { transform: [{ translateY: commentScrollY }] } : {}]}>
          <View style={styles.videoDetails}>
            {profilePic && <Image source={{ uri: profilePic }} style={styles.profilePic} />}
            <View style={styles.videoInfo}>
              {username && <Text style={styles.username}>{username}</Text>}
              <TouchableOpacity onPress={toggleComments}>
                {description && <Text style={styles.description}>{description}</Text>}
              </TouchableOpacity>
            </View>
          </View>
          {showComments && comments && Array.isArray(comments) && (
            <ScrollView style={styles.commentsSection}>
              {comments.map((comment, index) => (
                <View key={index} style={styles.comment}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </View>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.navText}>⌂</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MealPlanner')}>
          <Text style={styles.navText}>⌕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Upload')}>
          <Text style={styles.navText}>↥</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.navText}>⌾</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MyProfile')}>
          <Text style={styles.navText}>㋡</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  symbolContainer: {
    position: 'absolute',
    right: 10,
    top: '72%',
    alignItems: 'center',
  },
  symbol: {
    color: '#fff',
    fontSize: 30,
    marginVertical: 5,
  },
  videoDetailsContainer: {
    paddingBottom: 70,
    paddingTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  videoDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  videoInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#ddd',
  },
  commentsSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
  },
  comment: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  commentUser: {
    color: '#fff',
    fontWeight: 'bold',
  },
  commentText: {
    color: '#fff',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#000',
    paddingVertical: 20,
    borderTopColor: '#333',
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
    fontSize: 24,
  },
});

export default VideoPlayerScreen;
