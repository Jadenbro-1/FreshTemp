// HomeSocial.js

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  Animated,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Video from 'react-native-video';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import Navbar from './Navbar'; // Importing the Navbar component
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// Importing local assets
import profilePicLocal from '../assets/profilepic.jpg'; // Ensure the correct path
import starIcon from '../assets/star2.png'; // Favorite icon
import star3Icon from '../assets/star3.png'; // Favorited icon
import commentIcon from '../assets/comment.png'; // Comment icon
import closeIcon from '../assets/close.png'; // Close icon
import unlikedIcon from '../assets/unliked.png'; // Unliked icon
import likedIcon from '../assets/liked.png'; // Liked icon
import heartIcon from '../assets/liked.png'; // Heart icon for animation
import recipeIcon from '../assets/book2.png'; // Recipe icon (book2.png)

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DOUBLE_TAP_DELAY = 300; // milliseconds

const HomeSocial = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Use useIsFocused to detect screen focus

  const [videos, setVideos] = useState([]);
  const [showComments, setShowComments] = useState({});
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [starAnimations, setStarAnimations] = useState({}); // Separate star animation for each video
  const [heartAnimations, setHeartAnimations] = useState({}); // Separate heart animation for each video
  const [progressAnimations, setProgressAnimations] = useState({}); // Separate progress animation for each video
  const flatListRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [pausedVideos, setPausedVideos] = useState({}); // State to track paused videos
  const [activeTab, setActiveTab] = useState('Explore'); // State to track active top bar tab

  // Define the AsyncStorage key based on userId
  const userId = 1; // Replace with actual user ID from authentication
  const STORAGE_KEY_CURRENT_VIDEO_INDEX = `@HomeSocial:currentVideoIndex:${userId}`;
  // If needed, you can also define STORAGE_KEY_IN_PROGRESS_MEAL_PLAN

  // Refs for manual double-tap detection
  const lastTap = useRef(null);
  const timer = useRef(null);

  // Fetch videos from backend
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/media');
      const data = response.data;
      console.log('Fetched data:', data);

      const mappedVideos = data.map((video) => ({
        id: video.media_id.toString(),
        videoUrl: {
          uri: video.url.startsWith('http') ? video.url.replace('http://', 'https://') : video.url,
        },
        username: `@${video.author_first_name}-${video.author_last_name}`,
        profilePic: profilePicLocal, // Using the local profile picture
        description: video.recipe_description,
        recipe_id: video.recipe_id,
        comments: [
          { user: 'User1', text: 'Great video!' },
          { user: 'User2', text: 'I love this!' },
          { user: 'User3', text: 'Wow this food looks great!' },
          { user: 'User4', text: 'Jaden is an animal!' },
          { user: 'User5', text: 'Wow this is so cool' },
          { user: 'User6', text: 'I love this! And this app is so sick, keep up the good work!' },
          { user: 'User7', text: 'I love this so much!' },
          { user: 'User8', text: 'I love this!' },
        ],
        isFavorite: false,
        isLiked: false, // Added isLiked state
        isFollowed: false, // Added isFollowed state
        heartAnimation: new Animated.Value(0), // Separate animation for each video
        progressAnimation: new Animated.Value(0), // Separate progress animation for each video
      }));

      // Initialize star and heart animations for each video
      const initialStarAnimations = {};
      const initialHeartAnimations = {};
      const initialProgressAnimations = {};
      mappedVideos.forEach((video, index) => {
        initialStarAnimations[index] = new Animated.Value(0);
        initialHeartAnimations[index] = new Animated.Value(0);
        initialProgressAnimations[index] = new Animated.Value(0);
      });

      setStarAnimations(initialStarAnimations);
      setHeartAnimations(initialHeartAnimations);
      setProgressAnimations(initialProgressAnimations);

      setVideos(mappedVideos);
    } catch (error) {
      console.error('Error fetching media:', error.message);
      Alert.alert('Error', 'Failed to load media.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Load the saved current video index from AsyncStorage
  const loadCurrentVideoIndex = async () => {
    try {
      const savedIndex = await AsyncStorage.getItem(STORAGE_KEY_CURRENT_VIDEO_INDEX);
      if (savedIndex !== null) {
        const index = parseInt(savedIndex, 10);
        if (!isNaN(index) && index >= 0 && index < videos.length) {
          setCurrentVideoIndex(index);
          // Delay scrolling to ensure FlatList has rendered
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index, animated: false });
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error loading current video index:', error);
    }
  };

  // Save the current video index to AsyncStorage
  const saveCurrentVideoIndex = async (index) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CURRENT_VIDEO_INDEX, index.toString());
    } catch (error) {
      console.error('Error saving current video index:', error);
    }
  };

  // Use useFocusEffect to initialize the current video index when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      const initialize = async () => {
        await loadCurrentVideoIndex();
        // If needed, implement loadSavedMealPlanForEditing and checkSavedMealPlan
        // loadSavedMealPlanForEditing();
        // checkSavedMealPlan();
      };

      initialize();

      // Clean up function to clear timer when the component unmounts or loses focus
      return () => {
        if (timer.current) {
          clearTimeout(timer.current);
        }
      };
    }, [videos.length])
  );

  // Save the current video index whenever it changes
  useEffect(() => {
    if (currentVideoIndex >= 0 && currentVideoIndex < videos.length) {
      saveCurrentVideoIndex(currentVideoIndex);
    }
  }, [currentVideoIndex, videos.length]);

  // Pause videos when screen is not focused
  useEffect(() => {
    if (!isFocused) {
      // When the screen is not focused, pause all videos
      setPausedVideos(() => {
        const pausedState = {};
        videos.forEach((_, index) => {
          pausedState[index] = true;
        });
        return pausedState;
      });
    } else {
      // When the screen is focused, resume only the current video
      setPausedVideos(() => {
        const pausedState = {};
        videos.forEach((_, index) => {
          pausedState[index] = index !== currentVideoIndex;
        });
        return pausedState;
      });
    }
  }, [isFocused, currentVideoIndex, videos]);

  // Handle video visibility changes
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newVideoIndex = viewableItems[0].index;
      if (newVideoIndex !== currentVideoIndex) {
        setCurrentVideoIndex(newVideoIndex);
      }
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  // Toggle comments visibility
  const toggleComments = (index) => {
    setShowComments((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Star animation
  const animateStar = (index) => {
    Animated.sequence([
      Animated.timing(starAnimations[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(starAnimations[index], {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Toggle favorite status with conditional animation
  const toggleFavorite = (index) => {
    // Determine the new favorite status
    const isNowFavorite = !videos[index].isFavorite;

    // Update the favorite status in the state
    setVideos((prev) => {
      const newVideos = [...prev];
      newVideos[index].isFavorite = isNowFavorite;
      return newVideos;
    });

    // Trigger the star animation only if the video is now favorited
    if (isNowFavorite) {
      animateStar(index);
    }
  };

  // Toggle follow status
  const toggleFollow = (index) => {
    setVideos((prev) => {
      const newVideos = [...prev];
      newVideos[index].isFollowed = !newVideos[index].isFollowed;
      return newVideos;
    });
  };

  // Toggle like status with heart animation
  const toggleLike = (index) => {
    setVideos((prev) => {
      const newVideos = [...prev];
      newVideos[index].isLiked = !newVideos[index].isLiked;
      return newVideos;
    });
    animateHeart(index);
  };

  // Animate heart for a specific video
  const animateHeart = (index) => {
    Animated.sequence([
      Animated.timing(heartAnimations[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnimations[index], {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle play/pause toggle
  const handleSingleTap = (index) => {
    togglePause(index);
  };

  // Handle like on double tap
  const handleDoubleTap = (index) => {
    toggleLike(index);
  };

  // Handle single and double taps with manual detection
  const handleTap = (index) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = DOUBLE_TAP_DELAY;

    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      // Double Tap detected
      clearTimeout(timer.current);
      lastTap.current = null;
      handleDoubleTap(index);
    } else {
      lastTap.current = now;
      timer.current = setTimeout(() => {
        handleSingleTap(index);
        lastTap.current = null;
      }, DOUBLE_PRESS_DELAY);
    }
  };

  // Handle pause/play
  const togglePause = (index) => {
    setPausedVideos((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Navigate to recipe details with hardcoded recipeId = 79
  const navigateToRecipeDetails = () => {
    const hardcodedRecipeId = 162; // Hardcoded recipe ID

    try {
      navigation.navigate('RecipeDetails', { recipeId: hardcodedRecipeId });
    } catch (error) {
      console.error('Error navigating to recipe details:', error.message);
      Alert.alert('Navigation Error', 'Failed to navigate to recipe details.');
    }
  };

  // Handle top bar button press
  const handleTopBarPress = (tab) => {
    setActiveTab(tab);
    navigation.navigate('Home'); // Navigate to HomeSocial screen
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  // Render each video item
  const renderVideoItem = useCallback(
    ({ item, index }) => {
      // Handle video progress
      const handleProgress = (progress) => {
        const progressValue = progress.currentTime / (progress.seekableDuration || 1);
        progressAnimations[index].setValue(progressValue);
      };

      return (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.videoContainer}
          onPress={() => handleTap(index)}
        >
          {/* Top Bar with "Your Picks" and "Explore" */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={() => handleTopBarPress('Your Picks')}
              accessibilityLabel="Your Picks Tab"
              accessibilityHint="Navigate to Your Picks"
            >
              <Text style={styles.topBarButtonText}>Your Picks</Text>
              {activeTab === 'Your Picks' && <View style={styles.underline} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={() => handleTopBarPress('Explore')}
              accessibilityLabel="Explore Tab"
              accessibilityHint="Navigate to Explore"
            >
              <Text style={styles.topBarButtonText}>Explore</Text>
              {activeTab === 'Explore' && <View style={styles.underline} />}
            </TouchableOpacity>
          </View>

          {/* Video Player */}
          <View style={{ flex: 1 }}>
            {item.videoUrl && item.videoUrl.uri ? (
              <Video
                source={item.videoUrl} // Correctly passing the object with uri
                style={styles.video}
                resizeMode="cover"
                repeat
                paused={pausedVideos[index] || index !== currentVideoIndex}
                ignoreSilentSwitch="ignore" // Ensures audio plays even if the phone is in silent mode
                onError={(error) => {
                  console.log(`Error loading video ${item.id}:`, error);
                  Alert.alert('Video Error', 'Failed to load the video. Please try again later.');
                }}
                onLoadStart={() => console.log(`Loading video ${item.id}: ${item.videoUrl.uri}`)}
                onBuffer={(buffer) => {
                  if (buffer.isBuffering) {
                    console.log(`Buffering video ${item.id}`);
                  }
                }}
                onProgress={handleProgress}
              />
            ) : (
              <View style={styles.invalidVideoContainer}>
                <Text style={styles.invalidVideoText}>Invalid video URL</Text>
              </View>
            )}
          </View>

          {/* Video Progress Bar */}
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  }),
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
                onPress={() => toggleLike(index)}
                accessibilityLabel={item.isLiked ? 'Unlike Video' : 'Like Video'}
                accessibilityHint="Adds or removes a like from this video"
              >
                <Image
                  source={item.isLiked ? likedIcon : unlikedIcon}
                  style={[
                    styles.symbolIcon,
                    { tintColor: item.isLiked ? '#FF0000' : '#fff' }, // Red when liked
                  ]}
                  accessibilityLabel="Like Icon"
                />
              </TouchableOpacity>

              {/* Favorite Icon */}
              <TouchableOpacity
                onPress={() => toggleFavorite(index)}
                accessibilityLabel={item.isFavorite ? 'Unfavorite Video' : 'Favorite Video'}
                accessibilityHint="Adds or removes this video from your favorites"
              >
                <Image
                  source={item.isFavorite ? star3Icon : starIcon}
                  style={[
                    styles.symbolIcon,
                    { tintColor: item.isFavorite ? '#FFD700' : '#fff' }, // Gold when favorited
                  ]}
                  accessibilityLabel="Favorite Icon"
                />
              </TouchableOpacity>

              {/* Comments Icon */}
              <TouchableOpacity
                onPress={() => toggleComments(index)}
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
                <Image source={item.profilePic} style={styles.profilePic} />
                <View style={styles.videoInfo}>
                  <View style={styles.videoInfoHeader}>
                    <Text style={styles.username}>{item.username}</Text>
                    {/* Follow Button */}
                    <TouchableOpacity
                      onPress={() => toggleFollow(index)}
                      style={[
                        styles.followButton,
                        { borderColor: '#ddd' },
                      ]}
                      accessibilityLabel={item.isFollowed ? 'Unfollow' : 'Follow'}
                      accessibilityHint={item.isFollowed ? 'Unfollows the creator' : 'Follows the creator'}
                    >
                      <Text
                        style={[
                          styles.followButtonText,
                          { color: '#ddd' },
                        ]}
                      >
                        {item.isFollowed ? 'Following' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => toggleComments(index)}>
                    <Text style={styles.description}>{item.description}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Comments Section */}
          {showComments[index] && (
            <Animated.View
              style={[
                styles.commentsSection,
                {
                  transform: [{ translateY: 0 }],
                },
              ]}
            >
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>Comments</Text>
                <TouchableOpacity onPress={() => toggleComments(index)}>
                  <Image source={closeIcon} style={styles.closeIcon} accessibilityLabel="Close Comments" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.commentsList}>
                {item.comments.map((comment, commentIndex) => (
                  <View key={commentIndex} style={styles.comment}>
                    <Text style={styles.commentUser}>@{comment.user}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Heart Animation */}
          {item.isLiked && (
            <Animated.View
              style={[
                styles.heartAnimation,
                {
                  opacity: heartAnimations[index],
                  transform: [
                    {
                      scale: heartAnimations[index].interpolate({
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

          {/* Star Animation */}
          {item.isFavorite && (
            <Animated.View style={[styles.starAnimation, { opacity: starAnimations[index] || 0 }]}>
              <Text style={styles.starText}>★</Text>
            </Animated.View>
          )}
        </TouchableOpacity>
      );
    },
    [
      currentVideoIndex,
      showComments,
      starAnimations,
      heartAnimations,
      progressAnimations,
      pausedVideos,
      activeTab,
      toggleFavorite,
      toggleLike,
      toggleFollow,
      toggleComments,
      navigateToRecipeDetails,
    ]
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={screenHeight}
        pagingEnabled
        onEndReached={fetchVideos} // Load more videos when reaching the end
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        windowSize={3} // Preload one video before and after the current
        initialNumToRender={1}
        maxToRenderPerBatch={3}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
      />
      {/* Navbar component */}
      <Navbar currentScreen="Home" theme="dark" />
    </View>
  );
};

export default HomeSocial;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 50, // Adjust for status bar height if necessary
    paddingBottom: 10,
    zIndex: 2,
  },
  topBarButton: {
    alignItems: 'center',
  },
  topBarButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Cochin',
  },
  underline: {
    marginTop: 4,
    height: 2,
    width: '100%',
    backgroundColor: '#fff',
  },
  videoContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'flex-end',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  invalidVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  invalidVideoText: {
    color: 'white',
    fontSize: 16,
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
    bottom: 70, // Space for Navbar (assuming Navbar height is 60)
    width: '100%',
    height: screenHeight * 0.4, // 40% of the screen height
    backgroundColor: 'rgba(28, 28, 28, 0.95)',
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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