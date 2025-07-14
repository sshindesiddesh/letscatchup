/**
 * letscatchup.ai - Collaborative Meeting Planner
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * 
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 * 
 * @author Siddesh Shinde
 * @license MIT
 */

export type CategoryType = 'time' | 'location' | 'food' | 'activity';
export type SessionStatus = 'active' | 'finalized' | 'expired';
export type VoteValue = 1 | -1;

export interface Vote {
  userId: string;
  value: VoteValue;
  timestamp: Date;
}

export interface Keyword {
  id: string;
  text: string;
  category: CategoryType;
  votes: Map<string, Vote>; // userId -> vote
  totalScore: number;
  addedBy: string; // userId who added this keyword
  createdAt: Date;
}

export interface Participant {
  id: string;
  name: string;
  userCode: string; // 3-digit identification code
  joinedAt: Date;
  isCreator: boolean;
  isAdmin: boolean; // Admin rights (initially same as isCreator)
  socketId?: string; // For real-time updates
}

export interface PlanningSession {
  id: string;
  creator: string; // userId of creator
  adminUserId: string; // userId of current admin (initially same as creator)
  description: string;
  participants: Map<string, Participant>; // userId -> participant
  keywords: Map<string, Keyword>; // keywordId -> keyword
  consensus: {
    finalized: string[]; // keywordIds that reached consensus
    pending: string[]; // keywordIds still being voted on
  };
  status: SessionStatus;
  createdAt: Date;
  expiresAt: Date;
}

// API Request/Response types
export interface CreateSessionRequest {
  description: string;
  creatorName: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  shareLink: string;
  userId: string;
  userCode: string; // 3-digit code for the creator
}

export interface JoinSessionRequest {
  name: string;
}

export interface JoinSessionResponse {
  userId: string;
  userCode: string; // 3-digit code for the new participant
  sessionData: SessionData;
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

export interface DeleteSessionRequest {
  userId: string; // Must be admin to delete
}

export interface DeleteSessionResponse {
  success: boolean;
  message: string;
}

// Serializable session data for API responses
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

// Socket.io event types
export interface SocketEvents {
  // Client to server
  'join-session': (data: { sessionId: string; userId: string }) => void;
  'leave-session': (data: { sessionId: string; userId: string }) => void;

  // Server to client
  'session-updated': (sessionData: SessionData) => void;
  'participant-joined': (participant: ParticipantData) => void;
  'participant-left': (participantId: string) => void;
  'keyword-added': (keyword: KeywordData) => void;
  'vote-updated': (data: { keywordId: string; votes: VoteData[]; totalScore: number }) => void;
  'consensus-reached': (keywordIds: string[]) => void;
  'session-deleted': (data: { message: string; adminName: string }) => void;
  'name-conflict': (data: { name: string; conflictingUserCode: string }) => void;
}
