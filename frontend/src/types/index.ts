/**
 * letscatchup.ai - Frontend Type Definitions
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

// Core data types (matching backend)
export type CategoryType = 'time' | 'location' | 'food' | 'activity';
export type VoteValue = 1 | -1;
export type SessionStatus = 'active' | 'completed' | 'expired';

// API Data Transfer Objects
export interface SessionData {
  id: string;
  creator: string;
  adminUserId: string; // Current admin user ID
  description: string;
  participants: ParticipantData[];
  keywords: KeywordData[];
  consensus: {
    finalized: string[];
    pending: string[];
  };
  status: SessionStatus;
  createdAt: string;
  expiresAt: string;
}

export interface ParticipantData {
  id: string;
  name: string;
  userCode: string; // 3-digit identification code
  joinedAt: string;
  isCreator: boolean;
  isAdmin: boolean; // Admin rights
}

export interface KeywordData {
  id: string;
  text: string;
  category: CategoryType;
  votes: VoteData[];
  totalScore: number;
  addedBy: string;
  createdAt: string;
}

export interface VoteData {
  userId: string;
  value: VoteValue;
  timestamp: string;
}

// API Request Types
export interface CreateSessionRequest {
  description: string;
  creatorName: string;
}

export interface JoinSessionRequest {
  name: string;
}

export interface AddKeywordRequest {
  userId: string;
  text: string;
  category: CategoryType;
}

export interface VoteRequest {
  userId: string;
  keywordId: string;
  value: VoteValue;
}

// API Response Types
export interface CreateSessionResponse {
  sessionId: string;
  shareLink: string;
  userId: string;
  userCode: string; // 3-digit code for the creator
}

export interface JoinSessionResponse {
  userId: string;
  userCode: string; // 3-digit code for the new participant
  sessionData: SessionData;
}

export interface DeleteSessionRequest {
  userId: string; // Must be admin to delete
}

export interface DeleteSessionResponse {
  success: boolean;
  message: string;
}

// Socket.io Event Types
export interface ClientToServerEvents {
  'join-session': (data: { sessionId: string; userId: string }) => void;
  'add-keyword': (data: { sessionId: string; userId: string; text: string; category: string }) => void;
  'vote': (data: { sessionId: string; userId: string; keywordId: string; value: number }) => void;
  'typing': (data: { sessionId: string; userId: string; isTyping: boolean }) => void;
}

export interface ServerToClientEvents {
  'session-updated': (sessionData: SessionData) => void;
  'participant-joined': (participant: ParticipantData) => void;
  'participant-offline': (data: { userId: string; name: string }) => void;
  'participant-count-updated': (data: { total: number; online: number; timestamp: string }) => void;
  'keyword-added': (data: { keywordId: string; keyword: KeywordData; timestamp: string }) => void;
  'vote-updated': (data: { keywordId: string; totalScore: number; votes: VoteData[] }) => void;
  'consensus-reached': (data: { keywordIds: string[]; keywords: any[]; timestamp: string }) => void;
  'session-stats-updated': (data: { stats: any; timestamp: string }) => void;
  'user-typing': (data: { userId: string; isTyping: boolean; timestamp: string }) => void;
  'session-deleted': (data: { message: string; adminName: string }) => void;
  'name-conflict': (data: { name: string; conflictingUserCode: string }) => void;
  'error': (error: { message: string }) => void;
  'system-message': (data: { message: string; timestamp: string }) => void;
}

// UI State Types
export interface User {
  id: string;
  name: string;
  userCode: string; // 3-digit identification code
  isCreator: boolean;
  isAdmin: boolean; // Admin rights
}

export interface UIState {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  typingUsers: string[];
}

// Store State Types
export interface SessionStore {
  // Session data
  session: SessionData | null;
  user: User | null;

  // UI state
  ui: UIState;

  // Onboarding data
  onboardingResponses: Record<string, any>; // userId -> responses
  
  // Actions
  setSession: (session: SessionData) => void;
  setUser: (user: User) => void;
  updateKeyword: (keywordId: string, updates: Partial<KeywordData>) => void;
  addKeyword: (keyword: KeywordData) => void;
  updateParticipant: (participantId: string, updates: Partial<ParticipantData>) => void;
  addParticipant: (participant: ParticipantData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnected: (connected: boolean) => void;
  setTypingUsers: (users: string[]) => void;
  setOnboardingResponse: (userId: string, responses: any) => void;
  reset: () => void;
}

// Utility Types
export interface CategoryInfo {
  name: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

export interface ConsensusInfo {
  reached: boolean;
  percentage: number;
  positiveVotes: number;
  negativeVotes: number;
  totalVotes: number;
}

// Form Types
export interface CreateSessionForm {
  description: string;
  creatorName: string;
}

export interface JoinSessionForm {
  name: string;
}

export interface AddKeywordForm {
  text: string;
  category: CategoryType;
}

// Navigation Types
export interface RouteParams {
  sessionId?: string;
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  time: string;
  location: string;
  food: string;
  activity: string;
}
