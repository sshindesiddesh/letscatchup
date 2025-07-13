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

import { v4 as uuidv4 } from 'uuid';
import { llmService } from './LLMService';
import {
  PlanningSession,
  Participant,
  Keyword,
  Vote,
  CategoryType,
  VoteValue,
  SessionData,
  ParticipantData,
  KeywordData,
  VoteData
} from '../models/types';

export class SessionManager {
  private currentSession: PlanningSession | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup check every hour
    setInterval(() => this.cleanupExpiredSession(), 60 * 60 * 1000);
  }

  /**
   * Create a new planning session (MVP: only one session at a time)
   */
  createSession(description: string, creatorName: string): { sessionId: string; userId: string } {
    // Clean up any existing session
    if (this.currentSession) {
      this.cleanupSession();
    }

    const sessionId = 'current'; // MVP: fixed session ID
    const userId = this.generateUserId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const creator: Participant = {
      id: userId,
      name: creatorName,
      joinedAt: now,
      isCreator: true
    };

    this.currentSession = {
      id: sessionId,
      creator: userId,
      description,
      participants: new Map([[userId, creator]]),
      keywords: new Map(),
      consensus: {
        finalized: [],
        pending: []
      },
      status: 'active',
      createdAt: now,
      expiresAt
    };

    // Set cleanup timer
    this.scheduleCleanup(expiresAt);

    console.log(`📝 Session created: "${description}" by ${creatorName}`);
    return { sessionId, userId };
  }

  /**
   * Create a session with LLM analysis of the description
   */
  async createSessionWithLLM(description: string, creatorName: string): Promise<{
    sessionId: string;
    userId: string;
    analysis: {
      suggestedCategories: CategoryType[];
      context: string;
      keywords: string[];
    }
  }> {
    // Create the session first
    const result = this.createSession(description, creatorName);

    // Analyze the description with LLM
    let analysis;
    try {
      analysis = await llmService.analyzeMeetupDescription(description);
      console.log(`🤖 LLM analyzed description: ${analysis.suggestedCategories.join(', ')}`);
    } catch (error) {
      console.log(`⚠️ LLM analysis failed, using defaults`);
      analysis = {
        suggestedCategories: ['activity'] as CategoryType[],
        context: 'General meetup planning',
        keywords: []
      };
    }

    return {
      ...result,
      analysis
    };
  }

  /**
   * Join an existing session
   */
  joinSession(sessionId: string, name: string): { userId: string; success: boolean } {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      return { userId: '', success: false };
    }

    if (this.currentSession.status !== 'active') {
      return { userId: '', success: false };
    }

    const userId = this.generateUserId();
    const participant: Participant = {
      id: userId,
      name,
      joinedAt: new Date(),
      isCreator: false
    };

    this.currentSession.participants.set(userId, participant);
    
    console.log(`👋 ${name} joined session: ${this.currentSession.description}`);
    return { userId, success: true };
  }

  /**
   * Get current session data
   */
  getSession(sessionId: string): PlanningSession | null {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      return null;
    }
    return this.currentSession;
  }

  /**
   * Add a keyword to the session
   */
  addKeyword(sessionId: string, userId: string, text: string, category: CategoryType): Keyword | null {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      return null;
    }

    if (!this.currentSession.participants.has(userId)) {
      return null;
    }

    const keywordId = this.generateKeywordId();
    const keyword: Keyword = {
      id: keywordId,
      text: text.trim(),
      category,
      votes: new Map(),
      totalScore: 0,
      addedBy: userId,
      createdAt: new Date()
    };

    this.currentSession.keywords.set(keywordId, keyword);
    this.currentSession.consensus.pending.push(keywordId);

    const participant = this.currentSession.participants.get(userId);
    console.log(`💡 ${participant?.name} added keyword: "${text}" (${category})`);

    return keyword;
  }

  /**
   * Add a keyword with intelligent LLM categorization
   */
  async addKeywordWithLLM(sessionId: string, userId: string, text: string, suggestedCategory?: CategoryType): Promise<Keyword | null> {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      return null;
    }

    if (!this.currentSession.participants.has(userId)) {
      return null;
    }

    // Use LLM to categorize the keyword
    let category: CategoryType;
    try {
      const llmResponse = await llmService.categorizeKeyword(text);
      category = llmResponse.category;

      const participant = this.currentSession.participants.get(userId);
      console.log(`🤖 LLM categorized "${text}" as "${category}" (confidence: ${llmResponse.confidence})`);

      // If user provided a suggestion and LLM confidence is low, use user suggestion
      if (suggestedCategory && llmResponse.confidence < 0.7) {
        category = suggestedCategory;
        console.log(`👤 Using user suggestion "${suggestedCategory}" over LLM due to low confidence`);
      }
    } catch (error) {
      // Fallback to suggested category or default
      category = suggestedCategory || 'activity';
      console.log(`⚠️ LLM categorization failed, using fallback: ${category}`);
    }

    // Create the keyword using the regular method
    return this.addKeyword(sessionId, userId, text, category);
  }

  /**
   * Vote on a keyword
   */
  vote(sessionId: string, userId: string, keywordId: string, value: VoteValue): boolean {
    if (!this.currentSession || this.currentSession.id !== sessionId) {
      return false;
    }

    if (!this.currentSession.participants.has(userId)) {
      return false;
    }

    const keyword = this.currentSession.keywords.get(keywordId);
    if (!keyword) {
      return false;
    }

    // Update or add vote
    const vote: Vote = {
      userId,
      value,
      timestamp: new Date()
    };

    keyword.votes.set(userId, vote);
    
    // Recalculate total score
    keyword.totalScore = Array.from(keyword.votes.values())
      .reduce((sum, v) => sum + v.value, 0);

    // Check for consensus (simple rule: >60% positive votes, no strong negative)
    this.checkConsensus(keywordId);

    const participant = this.currentSession.participants.get(userId);
    const voteText = value > 0 ? '+1' : '-1';
    console.log(`🗳️  ${participant?.name} voted ${voteText} on "${keyword.text}"`);

    return true;
  }

  /**
   * Convert session to serializable format
   */
  serializeSession(session: PlanningSession): SessionData {
    return {
      id: session.id,
      creator: session.creator,
      description: session.description,
      participants: Array.from(session.participants.values()).map(this.serializeParticipant),
      keywords: Array.from(session.keywords.values()).map(this.serializeKeyword),
      consensus: session.consensus,
      status: session.status,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString()
    };
  }

  private serializeParticipant(participant: Participant): ParticipantData {
    return {
      id: participant.id,
      name: participant.name,
      joinedAt: participant.joinedAt.toISOString(),
      isCreator: participant.isCreator
    };
  }

  private serializeKeyword = (keyword: Keyword): KeywordData => {
    return {
      id: keyword.id,
      text: keyword.text,
      category: keyword.category,
      votes: Array.from(keyword.votes.values()).map(this.serializeVote),
      totalScore: keyword.totalScore,
      addedBy: keyword.addedBy,
      createdAt: keyword.createdAt.toISOString()
    };
  }

  private serializeVote = (vote: Vote): VoteData => {
    return {
      userId: vote.userId,
      value: vote.value,
      timestamp: vote.timestamp.toISOString()
    };
  }

  private checkConsensus(keywordId: string): void {
    if (!this.currentSession) return;

    const keyword = this.currentSession.keywords.get(keywordId);
    if (!keyword) return;

    const totalParticipants = this.currentSession.participants.size;
    const totalVotes = keyword.votes.size;
    const positiveVotes = Array.from(keyword.votes.values()).filter(v => v.value > 0).length;
    const negativeVotes = Array.from(keyword.votes.values()).filter(v => v.value < 0).length;

    // Consensus rules:
    // 1. At least 60% of participants voted positively
    // 2. Less than 25% voted negatively
    const positiveRatio = positiveVotes / totalParticipants;
    const negativeRatio = negativeVotes / totalParticipants;

    if (positiveRatio >= 0.6 && negativeRatio < 0.25) {
      // Move to consensus
      const pendingIndex = this.currentSession.consensus.pending.indexOf(keywordId);
      if (pendingIndex > -1) {
        this.currentSession.consensus.pending.splice(pendingIndex, 1);
        this.currentSession.consensus.finalized.push(keywordId);
        console.log(`✅ Consensus reached on: "${keyword.text}"`);
      }
    }
  }

  private generateUserId(): string {
    return `user_${uuidv4().slice(0, 8)}`;
  }

  private generateKeywordId(): string {
    return `keyword_${uuidv4().slice(0, 8)}`;
  }

  private scheduleCleanup(expiresAt: Date): void {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }

    const delay = expiresAt.getTime() - Date.now();
    this.cleanupTimer = setTimeout(() => {
      this.cleanupExpiredSession();
    }, delay);
  }

  private cleanupExpiredSession(): void {
    if (this.currentSession && new Date() > this.currentSession.expiresAt) {
      console.log(`🧹 Cleaning up expired session: ${this.currentSession.description}`);
      this.cleanupSession();
    }
  }

  private cleanupSession(): void {
    this.currentSession = null;
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // Getter for current session (for testing and debugging)
  get session(): PlanningSession | null {
    return this.currentSession;
  }
}

// Singleton instance for MVP
export const sessionManager = new SessionManager();
