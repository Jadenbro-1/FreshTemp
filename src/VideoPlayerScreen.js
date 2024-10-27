// VideoPlayerScreen.js

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Navbar from './Navbar'; // Importing the Navbar component

// Importing local assets
import profilePicLocal from '../assets/profilepic.jpg'; // Ensure the correct path
import starIcon from '../assets/star2.png'; // Favorite icon
import star3Icon from '../assets/star3.png'; // Favorited icon
import commentIcon from '../assets/comment.png'; // Comment icon
import closeIcon from '../assets/close.png'; // Close icon
import unlikedIcon from '../assets/unliked.png'; // Unliked icon
import likedIcon from '../assets/liked.png'; // Liked icon
import heartIcon from '../assets/liked.png'; // Heart icon for double-tap animation
import recipeIcon from '../assets/book2.png'; // Recipe icon (book2.png)
import leftIcon from '../assets/left.png'; // Back button icon

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const DOUBLE_TAP_DELAY = 300; // milliseconds

const VideoPlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    videoUrl,
    username,
    profilePic,
    description,
    isFavorite: initialIsFavorite,
    isLiked: initialIsLiked,
    recipe_id,
    comments: initialComments,
    fromScreen, // The screen from which the user navigated
  } = route.params;

  const [isPaused, setIsPaused] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const commentsTranslateY = useRef(new Animated.Value(screenHeight)).current;
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite || false);
  const [isLiked, setIsLiked] = useState(initialIsLiked || false);
  const [isFollowed, setIsFollowed] = useState(false); // State for Follow button
  const [starAnimation] = useState(new Animated.Value(0)); // Animation for favoriting
  const [heartAnimation] = useState(new Animated.Value(0)); // Animation for liking
  const [progress, setProgress] = useState(0); // Progress value for progress bar
  const [loading, setLoading] = useState(true); // Loading state for video

  // Comments data: use passed comments or fallback to fake comments
  const [comments, setComments] = useState(initialComments || [
    { user: 'foodlover92', text: 'Great recipe! Tried it last night and loved it.' },
    { user: 'chefmaster', text: 'Awesome video, keep up the good work!' },
    { user: 'healthy_eats', text: 'Can you make a vegan version of this?' },
    { user: 'cookingqueen', text: 'This looks so delicious 😋' },
    { user: 'homecook', text: 'Thanks for sharing, my family enjoyed it.' },
    { user: 'spicylover', text: 'I added some extra chili flakes, perfect!' },
    { user: 'sweets_tooth', text: 'Can’t wait to try this recipe out!' },
  ]);

  // Refs for manual double-tap detection
  const lastTap = useRef(null);
  const timer = useRef(null);

  // Handle pause/play when navigating away from the screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsPaused(true);
      };
    }, [])
  );

  // Toggle pause/play
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Handle back button press
  const handleBackPress = () => {
    navigation.goBack();
  };

  // Toggle favorite status with animation
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    animateStar();
  };

  // Toggle like status with animation
  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    animateHeart();
  };

  // Toggle follow status
  const toggleFollow = () => {
    setIsFollowed(!isFollowed);
  };

  // Show comments with animation
  const showCommentsSection = () => {
    setCommentsVisible(true);
    Animated.timing(commentsTranslateY, {
      toValue: screenHeight * 0.4, // Slide up to 60% visibility
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Hide comments with animation
  const hideCommentsSection = () => {
    Animated.timing(commentsTranslateY, {
      toValue: screenHeight, // Slide down to hide
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCommentsVisible(false);
    });
  };

  // Star animation for favoriting
  const animateStar = () => {
    Animated.sequence([
      Animated.timing(starAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(starAnimation, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Heart animation for liking
  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(heartAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Progress bar update
  const handleProgress = (progressData) => {
    const progressValue = progressData.currentTime / (progressData.seekableDuration || 1);
    setProgress(progressValue);
  };

  // Double-Tap Logic
  const handleTap = () => {
    const now = Date.now();
    if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
      // Double Tap detected
      clearTimeout(timer.current);
      lastTap.current = null;
      handleDoubleTap();
    } else {
      lastTap.current = now;
      timer.current = setTimeout(() => {
        handleSingleTap();
        lastTap.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  // Handle play/pause toggle
  const handleSingleTap = () => {
    togglePause();
  };

  // Handle like on double tap
  const handleDoubleTap = () => {
    handleLikeToggle();
  };

  // Navigate to recipe details with hardcoded recipeId = 162
  const navigateToRecipeDetails = () => {
    const hardcodedRecipeId = recipe_id || 162; // Use passed recipe_id or default to 162

    try {
      navigation.navigate('RecipeDetails', { recipeId: hardcodedRecipeId });
    } catch (error) {
      console.error('Error navigating to recipe details:', error.message);
      Alert.alert('Navigation Error', 'Failed to navigate to recipe details.');
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return (
    <View style={styles.background}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        accessibilityLabel="Go Back"
        accessibilityHint="Navigates to the previous screen"
      >
        <Image
          source={leftIcon} // Imported left icon
          style={styles.backIcon}
        />
      </TouchableOpacity>

      {/* Video Player with Double-Tap to Like */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={{ flex: 1 }}>
          <Video
            source={{ uri: videoUrl }} // Ensure videoUrl is a valid string
            style={styles.video}
            resizeMode="cover"
            repeat
            paused={isPaused}
            ignoreSilentSwitch="ignore" // Ensures audio plays even if the phone is in silent mode
            onError={(error) => {
              console.log(`Error loading video:`, error);
              Alert.alert('Video Error', 'Failed to load the video. Please try again later.');
            }}
            onLoadStart={() => {}}
            onLoad={() => {
              setLoading(false); // Video has loaded
            }}
            onBuffer={(buffer) => {
              if (buffer.isBuffering) {
                console.log(`Buffering video`);
              }
            }}
            onProgress={handleProgress}
          />

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

          {/* Heart Animation for Double-Tap Like */}
          {isLiked && (
            <Animated.View
              style={[
                styles.heartAnimation,
                {
                  opacity: heartAnimation,
                  transform: [
                    {
                      scale: heartAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.5],
                      }),
                    },
                  ],
                },
              ]}
              accessibilityLabel="Heart Animation"
            >
              <Image source={heartIcon} style={styles.heartIcon} />
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>

      {/* Overlay with Icons */}
      <View style={styles.overlay}>
        {/* Right Side: Like, Favorite, Comments, Recipe Icons */}
        <View style={styles.symbolContainer}>
          {/* Like Icon */}
          <TouchableOpacity
            onPress={handleLikeToggle}
            accessibilityLabel={isLiked ? 'Unlike Video' : 'Like Video'}
            accessibilityHint="Adds or removes a like from this video"
          >
            <Image
              source={isLiked ? likedIcon : unlikedIcon}
              style={[
                styles.symbolIcon,
                { tintColor: isLiked ? '#FF0000' : '#fff' }, // Red when liked
              ]}
              accessibilityLabel="Like Icon"
            />
          </TouchableOpacity>

          {/* Favorite Icon */}
          <TouchableOpacity
            onPress={handleFavoriteToggle}
            accessibilityLabel={isFavorite ? 'Unfavorite Video' : 'Favorite Video'}
            accessibilityHint="Adds or removes this video from your favorites"
          >
            <Image
              source={isFavorite ? star3Icon : starIcon}
              style={[
                styles.symbolIcon,
                { tintColor: isFavorite ? '#FFD700' : '#fff' }, // Gold when favorited
              ]}
              accessibilityLabel="Favorite Icon"
            />
          </TouchableOpacity>

          {/* Comments Icon */}
          <TouchableOpacity
            onPress={showCommentsSection}
            accessibilityLabel="View Comments"
            accessibilityHint="Shows the comments section"
          >
            <Image
              source={commentIcon}
              style={styles.symbolIcon}
              accessibilityLabel="Comments Icon"
            />
          </TouchableOpacity>

          {/* Recipe Icon */}
          <TouchableOpacity
            onPress={navigateToRecipeDetails}
            accessibilityLabel="View Recipe Details"
            accessibilityHint="Navigates to the recipe details screen"
          >
            <Image
              source={recipeIcon}
              style={styles.symbolIcon}
              accessibilityLabel="Recipe Icon"
            />
          </TouchableOpacity>
        </View>

        {/* Video Details */}
        <View style={styles.videoDetailsContainer}>
          <View style={styles.videoDetails}>
            <Image source={profilePic ? { uri: profilePic } : profilePicLocal} style={styles.profilePic} />
            <View style={styles.videoInfo}>
              <View style={styles.videoInfoHeader}>
                <Text style={styles.username}>{username}</Text>
                {/* Follow Button */}
                <TouchableOpacity
                  onPress={toggleFollow}
                  style={[
                    styles.followButton,
                    { borderColor: '#ddd' },
                  ]}
                  accessibilityLabel={isFollowed ? 'Unfollow' : 'Follow'}
                  accessibilityHint={isFollowed ? 'Unfollows the creator' : 'Follows the creator'}
                >
                  <Text
                    style={[
                      styles.followButtonText,
                      { color: '#ddd' },
                    ]}
                  >
                    {isFollowed ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={showCommentsSection}>
                <Text style={styles.description}>{description}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Comments Section */}
      {commentsVisible && (
        <Animated.View
          style={[
            styles.commentsSection,
            {
              transform: [{ translateY: commentsTranslateY }],
            },
          ]}
        >
          {/* Comments Header */}
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Comments</Text>
            <TouchableOpacity onPress={hideCommentsSection}>
              <Image
                source={closeIcon}
                style={styles.closeIcon}
                accessibilityLabel="Close Comments"
              />
            </TouchableOpacity>
          </View>
          {/* Comments List */}
          <ScrollView style={styles.commentsList}>
            {comments.map((comment, index) => (
              <View key={index} style={styles.comment}>
                <Text style={styles.commentUser}>@{comment.user}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Star Animation */}
      {isFavorite && (
        <Animated.View style={[styles.starAnimation, { opacity: starAnimation }]}>
          <Text style={styles.starText}>★</Text>
        </Animated.View>
      )}

      {/* Navbar */}
      <Navbar currentScreen={fromScreen || 'Home'} theme="dark" />
    </View>
  );
};

export default VideoPlayerScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: 50, // Adjust as needed for different devices or use SafeAreaView
    left: 10,
    zIndex: 2,
    padding: 6,
    borderRadius: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 70, // Space for Navbar (assuming Navbar height is 60)
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  symbolContainer: {
    position: 'absolute',
    right: 20,
    bottom: 150, // Positioning just above the description container
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
    marginVertical: 15,
  },
  videoDetailsContainer: {
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  videoDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#000',
  },
  videoInfo: {
    flex: 1,
  },
  videoInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  followButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 4,
  },
  commentsSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, // Align to the bottom of the screen
    height: screenHeight * 0.6, // 60% of the screen height
    backgroundColor: 'rgba(28, 28, 28, 0.99)',
    zIndex: 5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 15,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  commentsList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  comment: {
    marginBottom: 20,
  },
  commentUser: {
    color: '#5FC6FF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  starAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -95 }, { translateY: -100 }],
  },
  starText: {
    color: '#ffffff',
    fontSize: 190,
  },
  heartAnimation: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    width: 100,
    height: 100,
    tintColor: '#FF0000', // Red color for heart
    resizeMode: 'contain',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 70, // Above the navbar
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});