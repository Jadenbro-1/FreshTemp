// UserDashboard.js

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from './Navbar'; // Importing the Navbar component

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('trending');

  const screenWidth = Dimensions.get('window').width;

  const navigation = useNavigation();

  const trendingVideos = [
    { id: 1, chef: 'quickbites', title: 'Easy 5-min Breakfast', views: '1.2M', likes: '250K' },
    { id: 2, chef: 'pastaqueen', title: 'Perfect Carbonara', views: '890K', likes: '180K' },
    { id: 3, chef: 'veggielover', title: 'Colorful Buddha Bowl', views: '750K', likes: '120K' },
    { id: 4, chef: 'dessertking', title: 'No-Bake Cheesecake', views: '1.5M', likes: '300K' },
    { id: 5, chef: 'grillmaster', title: 'Juicy Steak Tips', views: '980K', likes: '200K' },
    { id: 6, chef: 'healthyeats', title: 'Green Smoothie Bowl', views: '670K', likes: '140K' },
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
      image: '/Users/jadenbro1/FreshTemp/assets/breakfast.png',
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
      image: '/Users/jadenbro1/FreshTemp/assets/breakfast.png',
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
      image: '/Users/jadenbro1/FreshTemp/assets/breakfast.png',
      description:
        'Decadent chocolate cake with a gooey, molten center. Served warm with a scoop of vanilla ice cream for the perfect indulgence.',
      prepTime: '25 min',
      servings: 6,
      difficulty: 'Medium',
      tags: ['Indulgent', 'Chocolate', 'Baking'],
    },
  ];

  const Header = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logoText}>Explore</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('WeeklyMealPlan')}
            >
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/schedule.png')}
                style={styles.iconImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('GroceryPlanner')}
            >
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/cart2.png')}
                style={styles.iconImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Pantry')}
            >
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/message.png')}
                style={styles.iconImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Nutritionist')}
            >
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/nutrition2.png')}
                style={styles.iconImage}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Image
            source={require('/Users/jadenbro1/FreshTemp/assets/search.png')}
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
              source={require('/Users/jadenbro1/FreshTemp/assets/filter.png')}
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
          >
            <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
              Trending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('chefs')}
            style={[styles.tabButton, activeTab === 'chefs' && styles.activeTabButton]}
          >
            <Text style={[styles.tabText, activeTab === 'chefs' && styles.activeTabText]}>
              Top Chefs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('dishes')}
            style={[styles.tabButton, activeTab === 'dishes' && styles.activeTabButton]}
          >
            <Text style={[styles.tabText, activeTab === 'dishes' && styles.activeTabText]}>
              Popular Dishes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ));

  const renderItem = ({ item }) => {
    if (activeTab === 'trending') {
      return (
        <View style={styles.videoCard}>
          <View style={styles.videoImageContainer}>
            <Image
              source={require('/Users/jadenbro1/FreshTemp/assets/breakfast.png')}
              style={styles.videoImage}
            />
            {/* Overlay */}
            <View style={styles.videoOverlay}>
              <TouchableOpacity style={styles.videoPlayButton} onPress={() => {}}>
                <Image
                  source={require('/Users/jadenbro1/FreshTemp/assets/play.png')}
                  style={styles.playIcon}
                />
              </TouchableOpacity>
              <View style={styles.videoInfoOverlay}>
                <Text style={styles.videoTitle}>{item.title}</Text>
                <Text style={styles.videoChef}>@{item.chef}</Text>
                <View style={styles.videoStats}>
                  <View style={styles.videoStatItem}>
                    <Text style={styles.heartIcon}>♥</Text>
                    <Text style={styles.statText}>{item.likes}</Text>
                  </View>
                  <View style={styles.videoStatItem}>
                    <Text style={styles.statText}>{item.views} views</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    } else if (activeTab === 'chefs') {
      return (
        <View style={styles.chefCard}>
          <View style={styles.chefHeader}>
            <Image
              source={require('/Users/jadenbro1/FreshTemp/assets/breakfast.png')}
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
              source={require('/Users/jadenbro1/FreshTemp/assets/favorite.png')}
              style={styles.starIcon}
            />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <TouchableOpacity style={styles.followButton} onPress={() => {}}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (activeTab === 'dishes') {
      return (
        <View style={styles.dishCard}>
          <Image
            source={require('/Users/jadenbro1/FreshTemp/assets/breakfast.png')}
            style={styles.dishImage}
          />
          <View style={styles.dishInfo}>
            <View style={styles.dishHeader}>
              <View>
                <Text style={styles.dishTitle}>{item.title}</Text>
                <Text style={styles.dishChef}>by @{item.chef}</Text>
              </View>
              <View style={styles.dishBadge}>
                <Text style={styles.dishBadgeText}>{item.category}</Text>
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
                  source={require('/Users/jadenbro1/FreshTemp/assets/clock.png')}
                  style={styles.statIcon}
                />
                <Text style={styles.statText}>{item.prepTime}</Text>
              </View>
              <View style={styles.dishStatItem}>
                <Text style={styles.statText}>{item.servings} servings</Text>
              </View>
              <Text style={styles.dishDifficulty}>{item.difficulty}</Text>
            </View>
            <View style={styles.dishFooter}>
              <View style={styles.dishLikes}>
                <Text style={styles.heartIcon}>♥</Text>
                <Text style={styles.likesText}>{item.likes} likes</Text>
              </View>
              <TouchableOpacity style={styles.viewRecipeButton} onPress={() => {}}>
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

      {/* FlatList */}
      <FlatList
        data={
          activeTab === 'trending'
            ? trendingVideos
            : activeTab === 'chefs'
            ? featuredChefs
            : popularDishes
        }
        keyExtractor={(item, index) => index.toString()}
        key={activeTab} // To handle numColumns changing
        numColumns={activeTab === 'trending' ? 2 : 1}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={renderItem}
      />

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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  videoPlayButton: {
    alignSelf: 'flex-end',
  },
  playIcon: {
    width: 20,
    height: 20,
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
    backgroundColor: '#5FC6FF',
    borderRadius: 6,
    paddingHorizontal: 6,
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