/**
 * letscatchup.ai - Local LLM Service
 * 
 * Service for interacting with local Ollama LLM for keyword categorization
 * and natural language processing
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type CategoryType = 'time' | 'location' | 'food' | 'activity';

interface LLMResponse {
  category: CategoryType;
  confidence: number;
  reasoning?: string;
}

class LLMService {
  private modelName: string = 'llama3';
  private isAvailable: boolean = false;

  constructor() {
    this.checkAvailability();
  }

  // Check if Ollama and the model are available
  private async checkAvailability(): Promise<void> {
    try {
      const { stdout } = await execAsync('ollama list');
      this.isAvailable = stdout.includes(this.modelName);
      
      if (this.isAvailable) {
        console.log(`🤖 LLM Service initialized with model: ${this.modelName}`);
      } else {
        console.warn(`⚠️ LLM model ${this.modelName} not found. Using fallback categorization.`);
      }
    } catch (error) {
      console.warn('⚠️ Ollama not available. Using fallback categorization.');
      this.isAvailable = false;
    }
  }

  // Categorize a keyword using LLM
  async categorizeKeyword(keyword: string): Promise<LLMResponse> {
    if (!this.isAvailable) {
      return this.fallbackCategorization(keyword);
    }

    try {
      const prompt = this.buildCategorizationPrompt(keyword);
      const response = await this.queryLLM(prompt);
      return this.parseCategorizationResponse(response, keyword);
    } catch (error) {
      console.error('LLM categorization failed:', error);
      return this.fallbackCategorization(keyword);
    }
  }

  // Analyze meetup description for context
  async analyzeMeetupDescription(description: string): Promise<{
    suggestedCategories: CategoryType[];
    context: string;
    keywords: string[];
  }> {
    if (!this.isAvailable) {
      return this.fallbackDescriptionAnalysis(description);
    }

    try {
      const prompt = this.buildDescriptionAnalysisPrompt(description);
      const response = await this.queryLLM(prompt);
      return this.parseDescriptionAnalysis(response);
    } catch (error) {
      console.error('LLM description analysis failed:', error);
      return this.fallbackDescriptionAnalysis(description);
    }
  }

  // Build prompt for keyword categorization
  private buildCategorizationPrompt(keyword: string): string {
    return `You are helping categorize keywords for a meetup planning app. 

Categorize this keyword: "${keyword}"

Categories:
- time: When to meet (times, dates, days, schedules)
- location: Where to meet (places, venues, areas, addresses)
- food: What to eat (restaurants, cuisines, meals, drinks)
- activity: What to do (activities, entertainment, events)

Respond with ONLY the category name (time, location, food, or activity). No explanation needed.`;
  }

  // Build prompt for description analysis
  private buildDescriptionAnalysisPrompt(description: string): string {
    return `Analyze this meetup description: "${description}"

Extract:
1. Most relevant categories (time, location, food, activity)
2. Key context about the meetup
3. Important keywords that participants might suggest

Respond in this format:
CATEGORIES: [list categories separated by commas]
CONTEXT: [brief context summary]
KEYWORDS: [relevant keywords separated by commas]`;
  }

  // Query the LLM via Ollama CLI
  private async queryLLM(prompt: string): Promise<string> {
    const command = `ollama run ${this.modelName} "${prompt.replace(/"/g, '\\"')}"`;
    
    try {
      const { stdout } = await execAsync(command, { 
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
      
      return stdout.trim();
    } catch (error) {
      throw new Error(`LLM query failed: ${error}`);
    }
  }

  // Parse LLM categorization response
  private parseCategorizationResponse(response: string, keyword: string): LLMResponse {
    const cleanResponse = response.toLowerCase().trim();
    
    // Extract category from response
    let category: CategoryType = 'activity'; // default
    let confidence = 0.5;

    if (cleanResponse.includes('time')) {
      category = 'time';
      confidence = 0.9;
    } else if (cleanResponse.includes('location')) {
      category = 'location';
      confidence = 0.9;
    } else if (cleanResponse.includes('food')) {
      category = 'food';
      confidence = 0.9;
    } else if (cleanResponse.includes('activity')) {
      category = 'activity';
      confidence = 0.9;
    } else {
      // Fallback to rule-based if LLM response is unclear
      const fallback = this.fallbackCategorization(keyword);
      category = fallback.category;
      confidence = 0.6;
    }

    return {
      category,
      confidence,
      reasoning: `LLM categorized "${keyword}" as ${category}`
    };
  }

  // Parse description analysis response
  private parseDescriptionAnalysis(response: string): {
    suggestedCategories: CategoryType[];
    context: string;
    keywords: string[];
  } {
    const lines = response.split('\n');
    let suggestedCategories: CategoryType[] = [];
    let context = '';
    let keywords: string[] = [];

    for (const line of lines) {
      if (line.startsWith('CATEGORIES:')) {
        const categoriesText = line.replace('CATEGORIES:', '').trim();
        suggestedCategories = categoriesText
          .split(',')
          .map(cat => cat.trim().toLowerCase())
          .filter(cat => ['time', 'location', 'food', 'activity'].includes(cat)) as CategoryType[];
      } else if (line.startsWith('CONTEXT:')) {
        context = line.replace('CONTEXT:', '').trim();
      } else if (line.startsWith('KEYWORDS:')) {
        const keywordsText = line.replace('KEYWORDS:', '').trim();
        keywords = keywordsText
          .split(',')
          .map(kw => kw.trim())
          .filter(kw => kw.length > 0);
      }
    }

    return {
      suggestedCategories: suggestedCategories.length > 0 ? suggestedCategories : ['activity'],
      context: context || 'General meetup planning',
      keywords: keywords.length > 0 ? keywords : []
    };
  }

  // Fallback categorization using simple rules
  private fallbackCategorization(keyword: string): LLMResponse {
    const lowerKeyword = keyword.toLowerCase();
    
    // Time keywords
    const timeKeywords = [
      'morning', 'afternoon', 'evening', 'night', 'am', 'pm',
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
      'today', 'tomorrow', 'weekend', 'weekday', 'hour', 'time',
      'early', 'late', 'noon', 'midnight', 'dawn', 'dusk', 'clock'
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
    if (timeKeywords.some(kw => lowerKeyword.includes(kw))) {
      return { category: 'time', confidence: 0.8, reasoning: 'Rule-based: contains time keywords' };
    }
    
    if (locationKeywords.some(kw => lowerKeyword.includes(kw))) {
      return { category: 'location', confidence: 0.8, reasoning: 'Rule-based: contains location keywords' };
    }
    
    if (foodKeywords.some(kw => lowerKeyword.includes(kw))) {
      return { category: 'food', confidence: 0.8, reasoning: 'Rule-based: contains food keywords' };
    }
    
    if (activityKeywords.some(kw => lowerKeyword.includes(kw))) {
      return { category: 'activity', confidence: 0.8, reasoning: 'Rule-based: contains activity keywords' };
    }
    
    // Default to activity
    return { category: 'activity', confidence: 0.5, reasoning: 'Default categorization' };
  }

  // Fallback description analysis
  private fallbackDescriptionAnalysis(description: string): {
    suggestedCategories: CategoryType[];
    context: string;
    keywords: string[];
  } {
    const lowerDesc = description.toLowerCase();
    const suggestedCategories: CategoryType[] = [];
    
    // Simple keyword extraction
    const words = description.split(/\s+/).filter(word => word.length > 2);
    const keywords = words.slice(0, 5); // Take first 5 meaningful words
    
    // Suggest categories based on description content
    if (lowerDesc.includes('time') || lowerDesc.includes('when') || lowerDesc.includes('schedule')) {
      suggestedCategories.push('time');
    }
    if (lowerDesc.includes('where') || lowerDesc.includes('place') || lowerDesc.includes('location')) {
      suggestedCategories.push('location');
    }
    if (lowerDesc.includes('food') || lowerDesc.includes('eat') || lowerDesc.includes('restaurant')) {
      suggestedCategories.push('food');
    }
    if (lowerDesc.includes('activity') || lowerDesc.includes('do') || lowerDesc.includes('play')) {
      suggestedCategories.push('activity');
    }
    
    return {
      suggestedCategories: suggestedCategories.length > 0 ? suggestedCategories : ['activity'],
      context: `Meetup: ${description.slice(0, 50)}...`,
      keywords
    };
  }

  // Check if LLM is available
  isLLMAvailable(): boolean {
    return this.isAvailable;
  }

  // Get model info
  getModelInfo(): { name: string; available: boolean } {
    return {
      name: this.modelName,
      available: this.isAvailable
    };
  }
}

// Create singleton instance
export const llmService = new LLMService();

export default llmService;
