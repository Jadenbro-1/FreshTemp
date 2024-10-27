// UserDashboard.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from './Navbar'; // Importing the Navbar component
import axios from 'axios';
import Video from 'react-native-video';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('trending');
  const [videos, setVideos] = useState([]);
  const [premiumRecipes, setPremiumRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get('window').width;

  const navigation = useNavigation();

  const trendingVideos = [
    { id: 1, chef: 'quickbites', title: 'Spicy Vodka Pasta', views: '1.2M', likes: '250K' },
    { id: 2, chef: 'pastaqueen', title: 'Creamy Basil Rotini', views: '890K', likes: '180K' },
    { id: 3, chef: 'veggielover', title: 'Tomato Ricotta Pasta', views: '750K', likes: '120K' },
    { id: 4, chef: 'dessertking', title: 'Cheesy Mac & Cheese', views: '1.5M', likes: '300K' },
    { id: 5, chef: 'grillmaster', title: 'Spicy Pollo Taco', views: '980K', likes: '200K' },
    { id: 6, chef: 'healthyeats', title: 'Spicy Pollo Quesadilla', views: '670K', likes: '140K' },
  ];

  const featuredChefs = [
    {
      name: 'Gordon Ramsay',
      username: 'gordonramsay',
      followers: '7.5M',
      specialty: 'Fine Dining',
      rating: 4.9,
      bio: 'Michelin-starred chef known for his fiery temper and exquisite cuisine.',
    },
    {
      name: 'Ina Garten',
      username: 'inagarten',
      followers: '3.2M',
      specialty: 'Home Cooking',
      rating: 4.8,
      bio: 'Beloved cookbook author and TV host, bringing gourmet flavors to home kitchens.',
    },
    {
      name: 'Jamie Oliver',
      username: 'jamieoliver',
      followers: '8.9M',
      specialty: 'Healthy Eating',
      rating: 4.7,
      bio: 'Passionate about making healthy eating accessible and delicious for everyone.',
    },
    {
      name: 'Giada De Laurentiis',
      username: 'giadadelaurentiis',
      followers: '2.8M',
      specialty: 'Italian Cuisine',
      rating: 4.6,
      bio: 'Bringing the flavors of Italy to your kitchen with a California twist.',
    },
    {
      name: 'Alton Brown',
      username: 'altonbrown',
      followers: '4.1M',
      specialty: 'Food Science',
      rating: 4.8,
      bio: 'Exploring the intersection of cooking, science, and history in the kitchen.',
    },
    {
      name: 'Padma Lakshmi',
      username: 'padmalakshmi',
      followers: '1.9M',
      specialty: 'Global Flavors',
      rating: 4.5,
      bio: 'Author, host, and executive producer, celebrating diverse cuisines and cultures.',
    },
  ];

  const popularDishes = [
    {
      title: 'Avocado Toast',
      chef: 'healthyeats',
      likes: 15000,
      category: 'Breakfast',
      rating: 4.5,
      image: require('../assets/breakfast.png'),
      description:
        'Creamy avocado spread on artisanal sourdough bread, topped with cherry tomatoes, feta cheese, and a drizzle of extra virgin olive oil.',
      prepTime: '10 min',
      servings: 2,
      difficulty: 'Easy',
      tags: ['Vegetarian', 'Quick', 'Nutritious'],
    },
    {
      title: 'Spicy Ramen',
      chef: 'noodlemaster',
      likes: 22000,
      category: 'Lunch',
      rating: 4.7,
      image: require('../assets/breakfast.png'),
      description:
        'Rich, savory broth with tender slices of pork, soft-boiled egg, nori, and a blend of spices that pack a flavorful punch.',
      prepTime: '30 min',
      servings: 4,
      difficulty: 'Medium',
      tags: ['Spicy', 'Comfort Food', 'Asian Cuisine'],
    },
    {
      title: 'Chocolate Lava Cake',
      chef: 'dessertqueen',
      likes: 18000,
      category: 'Dessert',
      rating: 4.8,
      image: require('../assets/breakfast.png'),
      description:
        'Decadent chocolate cake with a gooey, molten center. Served warm with a scoop of vanilla ice cream for the perfect indulgence.',
      prepTime: '25 min',
      servings: 6,
      difficulty: 'Medium',
      tags: ['Indulgent', 'Chocolate', 'Baking'],
    },
  ];

  useEffect(() => {
    const fetchVideosAndRecipes = async () => {
      try {
        // Fetch videos
        const videoResponse = await axios.get(
          'https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/media'
        );
        const videoData = videoResponse.data.map((video) => ({
          ...video,
          url: video.url.startsWith('http')
            ? video.url.replace('http://', 'https://')
            : video.url,
        }));
        setVideos(videoData.slice(0, 6)); // Get the first 6 videos

        // Fetch recipes
        const recipeResponse = await axios.get(
          'https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipes'
        );
        const recipesData = recipeResponse.data;

        // Map recipes to required format and filter for 5-star recipes
        const mappedRecipes = recipesData
          .filter((recipe) => recipe.ratings === 5)
          .slice(0, 3) // Get the first 3 premium recipes
          .map((recipe) => ({
            id: recipe.id,
            name: recipe.title,
            image: recipe.image || 'https://via.placeholder.com/150', // Adjust as needed
            rating: recipe.ratings || 0,
            category: recipe.category ? recipe.category.split(',').map((cat) => cat.trim()) : [],
            description: recipe.description,
            chef: 'Chef ' + (recipe.id % 10), // Hardcoded chef name
            tags: recipe.category ? recipe.category.split(',').map((cat) => cat.trim()) : ['Tag1', 'Tag2'],
            prepTime: recipe.prep_time || '0',
            servings: recipe.servings || 2,
            difficulty: recipe.difficulty || 'Medium',
            likes: recipe.likes || 0,
          }));

        setPremiumRecipes(mappedRecipes);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideosAndRecipes();
  }, []);

  const Header = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logoText}>Explore</Text>
          <View style={styles.headerIcons}>
            {/* Messages Icon */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Messenger')}
              accessibilityLabel="Messages"
              accessibilityHint="Navigate to your messages"
            >
              <Image
                source={require('../assets/message.png')}
                style={styles.iconImage}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Image
            source={require('../assets/search.png')}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search recipes, chefs, or ingredients..."
            placeholderTextColor="#374151"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            style={styles.searchInput}
          />
          {/* Filter Button */}
          <TouchableOpacity style={styles.filterButton} onPress={() => {}}>
            <Image
              source={require('../assets/filter.png')}
              style={styles.filterIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  });

  const Tabs = React.memo(() => (
    <View style={styles.tabsContainer}>
      <View style={styles.tabsHeader}>
        <View style={styles.tabsList}>
          <TouchableOpacity
            onPress={() => setActiveTab('trending')}
            style={[styles.tabButton, activeTab === 'trending' && styles.activeTabButton]}
            accessibilityLabel="Trending Tab"
            accessibilityHint="Show trending videos"
          >
            <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
              Trending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('chefs')}
            style={[styles.tabButton, activeTab === 'chefs' && styles.activeTabButton]}
            accessibilityLabel="Top Chefs Tab"
            accessibilityHint="Show top chefs"
          >
            <Text style={[styles.tabText, activeTab === 'chefs' && styles.activeTabText]}>
              Top Chefs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('dishes')}
            style={[styles.tabButton, activeTab === 'dishes' && styles.activeTabButton]}
            accessibilityLabel="Popular Dishes Tab"
            accessibilityHint="Show popular dishes"
          >
            <Text style={[styles.tabText, activeTab === 'dishes' && styles.activeTabText]}>
              Popular Dishes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ));

  const renderItem = ({ item, index }) => {
    if (activeTab === 'trending') {
      const hardcodedData = trendingVideos[index % trendingVideos.length];
      return (
        <TouchableOpacity
          style={styles.videoCard}
          onPress={() =>
            navigation.navigate('VideoPlayer', {
              videoUrl: item.url,
              username: item.username || 'unknown',
              profilePic: item.profile_pic_url || '',
              description: item.description || 'No description available',
              comments: item.comments || [],
              isFavorite: item.isFavorite || false,
              isSubscribed: item.isSubscribed || false,
            })
          }
          accessibilityLabel={`Play video: ${hardcodedData.title}`}
          accessibilityHint="Navigate to video player"
        >
          <View style={styles.videoImageContainer}>
            {item.url ? (
              <Video
                source={{ uri: item.url }}
                style={styles.videoImage}
                resizeMode="cover"
                repeat={false}
                paused={true}
                onError={(error) => console.error(`Error loading video ${item.media_id}:`, error)}
              />
            ) : (
              <Image
                source={require('../assets/breakfast.png')}
                style={styles.videoImage}
              />
            )}
            {/* Overlay */}
            <View style={styles.videoOverlay}>
              {/* Play Icon */}
              <View style={styles.videoPlayButton}>
                <Image
                  source={require('../assets/play.png')}
                  style={styles.playIcon}
                />
              </View>
              {/* Video Info */}
              <View style={styles.videoInfoOverlay}>
                <Text style={styles.videoTitle}>{hardcodedData.title}</Text>
                <Text style={styles.videoChef}>@{hardcodedData.chef}</Text>
                <View style={styles.videoStats}>
                  <View style={styles.videoStatItem}>
                    <Text style={styles.heartIcon}>♥</Text>
                    <Text style={styles.statText}>{hardcodedData.likes}</Text>
                  </View>
                  <View style={styles.videoStatItem}>
                    <Text style={styles.statText}>{hardcodedData.views} views</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else if (activeTab === 'chefs') {
      return (
        <View style={styles.chefCard}>
          <View style={styles.chefHeader}>
            <Image
              source={require('../assets/breakfast.png')}
              style={styles.chefAvatar}
            />
            <View style={styles.chefInfo}>
              <Text style={styles.chefName}>{item.name}</Text>
              <Text style={styles.chefUsername}>@{item.username}</Text>
            </View>
          </View>
          <Text style={styles.chefBio}>{item.bio}</Text>
          <View style={styles.chefStats}>
            <Text style={styles.chefFollowers}>{item.followers} followers</Text>
            <View style={styles.chefBadge}>
              <Text style={styles.chefBadgeText}>{item.specialty}</Text>
            </View>
          </View>
          <View style={styles.chefRating}>
            <Image
              source={require('../assets/favorite.png')}
              style={styles.starIcon}
            />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <TouchableOpacity
            style={styles.followButton}
            onPress={() => {}}
            accessibilityLabel="Follow Chef"
            accessibilityHint="Follow this chef to see their recipes"
          >
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (activeTab === 'dishes') {
      return (
        <View style={styles.dishCard}>
          <Image
            source={{ uri: item.image }}
            style={styles.dishImage}
          />
          <View style={styles.dishInfo}>
            <View style={styles.dishHeader}>
              <View>
                <Text style={styles.dishTitle}>{item.name}</Text>
                <Text style={styles.dishChef}>by @{item.chef}</Text>
              </View>
              <View style={styles.dishBadge}>
                <Text style={styles.dishBadgeText}>Premium</Text>
              </View>
            </View>
            <Text style={styles.dishDescription}>{item.description}</Text>
            <View style={styles.dishTags}>
              {item.tags.map((tag, tagIndex) => (
                <View key={tagIndex} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <View style={styles.dishStats}>
              <View style={styles.dishStatItem}>
                <Image
                  source={require('../assets/clock.png')}
                  style={styles.statIcon}
                />
                <Text style={styles.statText}>{item.prepTime} min</Text>
              </View>
              <View style={styles.dishStatItem}>
                <Image
                  source={require('../assets/servings.png')} // Added servings.png
                  style={styles.statIcon}
                />
                <Text style={styles.statText}>{item.servings} servings</Text>
              </View>
              <Text style={styles.dishDifficulty}>{item.difficulty}</Text>
            </View>
            <View style={styles.dishFooter}>
              <View style={styles.dishLikes}>
                <Text style={styles.heartIcon}>♥</Text>
                <Text style={styles.likesText}>{item.likes} likes</Text>
              </View>
              <TouchableOpacity
                style={styles.viewRecipeButton}
                onPress={() => navigation.navigate('RecipeDetails', { recipeId: item.id })}
                accessibilityLabel="View Recipe"
                accessibilityHint="Navigate to the recipe details"
              >
                <Text style={styles.viewRecipeButtonText}>View Recipe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header />

      {/* Tabs */}
      <Tabs />

{/* Loading Indicator */}
{loading && (
  <View style={styles.loadingContainer}>
    <Image
      source={require('../assets/loading3.gif')}
      style={styles.loadingGif}
    />
  </View>
)}

      {/* FlatList */}
      {!loading && (
        <FlatList
          data={
            activeTab === 'trending'
              ? videos
              : activeTab === 'chefs'
              ? featuredChefs
              : premiumRecipes
          }
          keyExtractor={(item, index) => index.toString()}
          key={activeTab} // To handle numColumns changing
          numColumns={activeTab === 'trending' ? 2 : 1}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={renderItem}
        />
      )}

      {/* Navbar */}
      <Navbar currentScreen="Search" />
    </View>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: 42,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGif: {
    width: 200,
    height: 200,
  },
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5FC6FF',
    fontFamily: 'Cochin', // Set an elegant font
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: '#5FC6FF',
  },
  // Search Bar Styles
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#9ca3af',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#111827',
  },
  filterButton: {
    marginLeft: 8,
  },
  filterIcon: {
    width: 20,
    height: 20,
    tintColor: '#9ca3af',
  },
  // Tabs Styles
  tabsContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingBottom: 2,
  },
  tabsHeader: {
    marginBottom: 8,
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 9999,
    marginHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 9999,
  },
  activeTabButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '600',
  },
  // Trending Videos Styles
  videoCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 8,
    overflow: 'hidden',
    elevation: 1,
  },
  videoImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#000',
  },
  videoImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  videoPlayButton: {
    alignSelf: 'flex-end',
  },
  playIcon: {
    width: 18,
    height: 18,
    tintColor: 'white',
  },
  videoInfoOverlay: {
    marginTop: 'auto',
  },
  videoTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#ffffff',
  },
  videoChef: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  videoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  videoStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 12,
    color: '#ef4444',
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: '#ffffff',
  },
  // Chefs Styles
  chefCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
  },
  chefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chefAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#bbf7d0',
    marginRight: 16,
    backgroundColor: '#000',
  },
  chefInfo: {
    flex: 1,
  },
  chefName: {
    fontSize: 18,
    fontWeight: '600',
  },
  chefUsername: {
    fontSize: 14,
    color: '#6b7280',
  },
  chefBio: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  chefStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chefFollowers: {
    fontSize: 14,
    color: '#6b7280',
  },
  chefBadge: {
    backgroundColor: '#5FC6FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chefBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  chefRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starIcon: {
    width: 16,
    height: 16,
    tintColor: '#f59e0b',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  followButton: {
    backgroundColor: '#5FC6FF',
    borderRadius: 9999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
  },
  // Dishes Styles
  dishCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  dishImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  dishInfo: {
    padding: 16,
  },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dishTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  dishChef: {
    fontSize: 14,
    color: '#6b7280',
  },
  dishBadge: {
    backgroundColor: '#A9CCE3', // Changed to a different color to distinguish
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  dishBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  dishDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  dishTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
  },
  dishStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  dishStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 14,
    height: 14,
    tintColor: '#6b7280',
    marginRight: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
  },
  dishDifficulty: {
    fontSize: 14,
    fontWeight: '600',
  },
  dishFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dishLikes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewRecipeButton: {
    backgroundColor: '#5FC6FF',
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewRecipeButtonText: {
    color: 'white',
    fontSize: 14,
  },
});