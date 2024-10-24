import React, { useState, useRef, useEffect } from 'react';
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
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Navbar from './Navbar'; // Importing the Navbar component

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HomeSocial = () => {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [showComments, setShowComments] = useState({});
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [commentScrollY] = useState(new Animated.Value(0));
  const [starAnimation] = useState(new Animated.Value(0));
  const flatListRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/media');
      const data = response.data;
      console.log('Fetched data:', data);

      const mappedVideos = data.map((video, index) => ({
        id: video.media_id.toString(),
        videoUrl: {
          uri: video.url.startsWith('http') ? video.url.replace('http://', 'https://') : video.url,
        },
        username: `@${video.author_first_name}-${video.author_last_name}`,
        profilePic: '/Users/jadenbro1/FreshTemp/assets/profilepic.jpg',
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
        isSubscribed: false,
        isPaused: index !== 0,
      }));

      setVideos(mappedVideos);
    } catch (error) {
      console.error('Error fetching media:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchVideos();
      setVideos((prevVideos) => prevVideos.map((video) => ({ ...video, isPaused: true })));

      return () => {
        setVideos((prevVideos) => prevVideos.map((video) => ({ ...video, isPaused: true })));
      };
    }, [])
  );

  const loadMoreVideos = () => {};

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newVideoIndex = viewableItems[0].index;
      if (newVideoIndex !== currentVideoIndex) {
        setCurrentVideoIndex(newVideoIndex);
        setVideos((prevVideos) =>
          prevVideos.map((video, index) => ({
            ...video,
            isPaused: index !== newVideoIndex,
          }))
        );
      }
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const toggleComments = (index) => {
    setShowComments((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const animateStar = () => {
    Animated.timing(starAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(starAnimation, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    });
  };

  const toggleFavorite = (index) => {
    setVideos((prev) => {
      const newVideos = [...prev];
      newVideos[index].isFavorite = !newVideos[index].isFavorite;
      return newVideos;
    });
    animateStar();
  };

  const toggleSubscribe = (index) => {
    setVideos((prev) => {
      const newVideos = [...prev];
      newVideos[index].isSubscribed = !newVideos[index].isSubscribed;
      return newVideos;
    });
  };

  const togglePause = (index) => {
    setVideos((prev) => {
      const newVideos = [...prev];
      newVideos[index].isPaused = !newVideos[index].isPaused;
      return newVideos;
    });
  };

  const fetchRecipeDetails = async (recipeId) => {
    try {
      console.log(`Fetching recipe details for ID: ${recipeId}`);
      const response = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipe/${recipeId}`
      );
      console.log('Recipe details response:', response.data);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      console.error('Error fetching recipe details:', error.config);
      throw error;
    }
  };

  const navigateToRecipeDetails = async (index) => {
    const recipeId = videos[index].recipe_id;
    if (!recipeId) {
      console.error('No recipe_id found for video at index', index);
      return;
    }

    try {
      const recipeDetails = await fetchRecipeDetails(recipeId);
      if (recipeDetails) {
        navigation.navigate('RecipeDetails', { recipeId: recipeDetails.id });
      } else {
        console.error('Recipe details not found for recipe_id', recipeId);
      }
    } catch (error) {
      console.error('Error navigating to recipe details:', error.message);
    }
  };

  const renderVideoItem = ({ item, index }) => {
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx > 100) {
          toggleFavorite(index);
        } else if (gestureState.dx < -100) {
          navigateToRecipeDetails(index);
        }
      },
      onPanResponderRelease: () => {
        if (videos[index].isFavorite) {
          animateStar();
        }
      },
    });

    return (
      <View style={styles.videoContainer} {...panResponder.panHandlers}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => togglePause(index)}
          style={{ flex: 1 }}
        >
          {item.videoUrl ? (
            <Video
              key={`${item.id}-${currentVideoIndex === index}`}
              source={{ uri: item.videoUrl.uri }}
              style={styles.video}
              resizeMode="cover"
              repeat
              paused={item.isPaused}
              onError={(error) => console.log(`Error loading video ${item.id}:`, error)}
              onLoadStart={() =>
                console.log(`Loading video ${item.id}: ${item.videoUrl.uri}`)
              }
            />
          ) : (
            <Text style={{ color: 'white' }}>Invalid video URL</Text>
          )}
        </TouchableOpacity>
        <View style={styles.overlay}>
          {!showComments[index] && (
            <View style={styles.symbolContainer}>
              <TouchableOpacity onPress={() => toggleFavorite(index)}>
                <Text style={styles.symbol}>{item.isFavorite ? '★' : '☆'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleSubscribe(index)}>
                <Text style={styles.symbol}>{item.isSubscribed ? '⊖' : '⊕'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateToRecipeDetails(index)}>
                <Text style={styles.symbol}>{'⊜'}</Text>
              </TouchableOpacity>
            </View>
          )}
          <Animated.View style={[styles.videoDetailsContainer]}>
            <View style={styles.videoDetails}>
              <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
              <View style={styles.videoInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <TouchableOpacity onPress={() => toggleComments(index)}>
                  <Text style={styles.description}>{item.description}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {showComments[index] && (
              <View style={styles.commentsSection}>
                <ScrollView style={styles.commentsScrollView}>
                  {item.comments.map((comment, commentIndex) => (
                    <View key={commentIndex} style={styles.comment}>
                      <Text style={styles.commentUser}>{comment.user}</Text>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.closeCommentsButton}
                  onPress={() => toggleComments(index)}
                >
                  <Text style={styles.closeCommentsText}>Close Comments</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
        <Animated.View style={[styles.starAnimation, { opacity: starAnimation }]}>
          <Text style={styles.starText}>★</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.background}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={() => navigation.navigate('YourPicks')}
        >
          <Text style={styles.topBarButtonText}>Your Picks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={() => navigation.navigate('Explore')}
        >
          <Text style={styles.topBarButtonText}>Explore</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
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
          onEndReached={loadMoreVideos}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      )}
      {/* Added Navbar component */}
      <Navbar currentScreen="Home" theme="dark" />
  </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 1,
    paddingVertical: 50,
  },
  topBarButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  topBarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  videoContainer: {
    width: screenWidth,
    height: screenHeight,
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
    top: '66%',
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
    width: 30,
    height: 30,
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 10,
    maxHeight: screenHeight * 0.4, // Limit the height of the comments section
  },
  commentsScrollView: {
    maxHeight: screenHeight * 0.3, // Limit the height of the ScrollView
  },
  comment: {
    padding: 10,
    borderBottomWidth: 0,
    borderBottomColor: '#333',
  },
  commentUser: {
    color: '#fff',
    fontWeight: 'bold',
  },
  commentText: {
    color: '#fff',
  },
  closeCommentsButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#444',
    borderRadius: 5,
  },
  closeCommentsText: {
    color: '#fff',
    fontSize: 16,
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
});

export default HomeSocial;