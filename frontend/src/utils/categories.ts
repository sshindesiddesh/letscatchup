/**
 * letscatchup.ai - Category Utilities
 * 
 * Utility functions and constants for keyword categories
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import type { CategoryType, CategoryInfo } from '../types';

// Category configuration
export const CATEGORIES: Record<CategoryType, CategoryInfo> = {
  time: {
    name: 'Time',
    color: 'text-time-600',
    bgColor: 'bg-time-50',
    icon: '🕐',
    description: 'When to meet',
  },
  location: {
    name: 'Location',
    color: 'text-location-600',
    bgColor: 'bg-location-50',
    icon: '📍',
    description: 'Where to meet',
  },
  food: {
    name: 'Food',
    color: 'text-food-600',
    bgColor: 'bg-food-50',
    icon: '🍽️',
    description: 'What to eat',
  },
  activity: {
    name: 'Activity',
    color: 'text-activity-600',
    bgColor: 'bg-activity-50',
    icon: '🎯',
    description: 'What to do',
  },
};

// Get category info
export function getCategoryInfo(category: CategoryType): CategoryInfo {
  return CATEGORIES[category];
}

// Get category color classes
export function getCategoryColors(category: CategoryType) {
  const info = getCategoryInfo(category);
  return {
    text: info.color,
    bg: info.bgColor,
    border: `border-${category}-200`,
    hover: `hover:bg-${category}-100`,
  };
}

// Get all categories as array
export function getAllCategories(): CategoryType[] {
  return Object.keys(CATEGORIES) as CategoryType[];
}

// Category validation
export function isValidCategory(category: string): category is CategoryType {
  return category in CATEGORIES;
}

// Get category suggestions based on text
export function suggestCategory(text: string): CategoryType {
  const lowerText = text.toLowerCase();
  
  // Time keywords
  const timeKeywords = [
    'morning', 'afternoon', 'evening', 'night', 'am', 'pm',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'today', 'tomorrow', 'weekend', 'weekday', 'hour', 'time',
    'early', 'late', 'noon', 'midnight', 'dawn', 'dusk'
  ];
  
  // Location keywords
  const locationKeywords = [
    'park', 'cafe', 'restaurant', 'bar', 'mall', 'downtown', 'uptown',
    'beach', 'mountain', 'lake', 'river', 'street', 'avenue', 'road',
    'home', 'office', 'school', 'university', 'library', 'gym',
    'near', 'close', 'far', 'central', 'north', 'south', 'east', 'west'
  ];
  
  // Food keywords
  const foodKeywords = [
    'breakfast', 'lunch', 'dinner', 'brunch', 'snack', 'coffee', 'tea',
    'pizza', 'burger', 'sushi', 'pasta', 'salad', 'sandwich', 'soup',
    'restaurant', 'cafe', 'bakery', 'deli', 'food', 'eat', 'drink',
    'cuisine', 'menu', 'order', 'takeout', 'delivery'
  ];
  
  // Activity keywords
  const activityKeywords = [
    'movie', 'film', 'concert', 'show', 'game', 'sport', 'exercise',
    'walk', 'hike', 'bike', 'run', 'swim', 'play', 'watch',
    'shopping', 'museum', 'gallery', 'theater', 'club', 'party',
    'meeting', 'discussion', 'chat', 'talk', 'presentation'
  ];
  
  // Check for matches
  if (timeKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'time';
  }
  
  if (locationKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'location';
  }
  
  if (foodKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'food';
  }
  
  if (activityKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'activity';
  }
  
  // Default to activity if no clear match
  return 'activity';
}

// Format category for display
export function formatCategoryName(category: CategoryType): string {
  return CATEGORIES[category].name;
}

// Get category emoji
export function getCategoryEmoji(category: CategoryType): string {
  return CATEGORIES[category].icon;
}
