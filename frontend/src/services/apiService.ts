/**
 * letscatchup.ai - API Service
 * 
 * HTTP API service for REST endpoint communication
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import type {
  CreateSessionRequest,
  CreateSessionResponse,
  JoinSessionRequest,
  JoinSessionResponse,
  AddKeywordRequest,
  VoteRequest,
  DeleteSessionRequest,
  DeleteSessionResponse,
  SessionData,
  ParticipantData,
  ApiError,
} from '../types';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  // Generic request method with error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: errorData.code,
        };
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw {
          message: 'Network error. Please check your connection.',
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request<{
      status: string;
      hasActiveSession: boolean;
      sessionId: string | null;
      participantCount: number;
      keywordCount: number;
    }>('/session/health');
  }

  // Create new session
  async createSession(data: CreateSessionRequest): Promise<CreateSessionResponse> {
    return this.request<CreateSessionResponse>('/session/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Join existing session
  async joinSession(sessionId: string, data: JoinSessionRequest): Promise<JoinSessionResponse> {
    return this.request<JoinSessionResponse>(`/session/${sessionId}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get session data
  async getSession(sessionId: string): Promise<SessionData> {
    return this.request<SessionData>(`/session/${sessionId}`);
  }

  // Add keyword to session
  async addKeyword(sessionId: string, data: AddKeywordRequest) {
    return this.request<{
      id: string;
      text: string;
      category: string;
      addedBy: string;
      createdAt: string;
    }>(`/session/${sessionId}/keywords`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Vote on keyword
  async vote(sessionId: string, data: VoteRequest) {
    return this.request<{
      keywordId: string;
      totalScore: number;
      voteCount: number;
      userVote: number;
    }>(`/session/${sessionId}/vote`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get session participants
  async getParticipants(sessionId: string): Promise<{ participants: ParticipantData[] }> {
    return this.request<{ participants: ParticipantData[] }>(`/session/${sessionId}/participants`);
  }

  // === Current Session API (MVP: Single Session) ===

  // Get current session data
  async getCurrentSession(): Promise<SessionData> {
    return this.request<SessionData>('/session/current');
  }

  // Join current session
  async joinCurrentSession(data: JoinSessionRequest): Promise<JoinSessionResponse> {
    return this.request<JoinSessionResponse>('/session/current/join', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Rejoin current session with user code
  async rejoinCurrentSession(data: { userCode: string }): Promise<{
    userId: string;
    userCode: string;
    userData: {
      name: string;
      isCreator: boolean;
      isAdmin: boolean;
    };
    sessionData: SessionData;
  }> {
    return this.request<{
      userId: string;
      userCode: string;
      userData: {
        name: string;
        isCreator: boolean;
        isAdmin: boolean;
      };
      sessionData: SessionData;
    }>('/session/current/rejoin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Add keyword to current session
  async addKeywordToCurrent(data: AddKeywordRequest) {
    return this.request<{
      id: string;
      text: string;
      category: string;
      addedBy: string;
      createdAt: string;
    }>('/session/current/keywords', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Vote on keyword in current session
  async voteInCurrent(data: VoteRequest) {
    return this.request<{
      keywordId: string;
      totalScore: number;
      votes: Array<{
        userId: string;
        value: number;
        timestamp: string;
      }>;
    }>('/session/current/vote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Delete current session (admin only)
  async deleteCurrentSession(data: DeleteSessionRequest): Promise<DeleteSessionResponse> {
    return this.request<DeleteSessionResponse>('/session/current', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  // Delete session (admin only)
  async deleteSession(sessionId: string, data: DeleteSessionRequest): Promise<DeleteSessionResponse> {
    return this.request<DeleteSessionResponse>(`/session/${sessionId}`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export for use in components
export default apiService;
