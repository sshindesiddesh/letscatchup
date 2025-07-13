/**
 * letscatchup.ai - Session Hooks
 * 
 * Custom React hooks for session management and real-time features
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import { useEffect, useCallback, useState } from 'react';
import { useSessionStore, useUser, useSession, useUIState } from '../store/sessionStore';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';
import type { 
  CreateSessionRequest, 
  JoinSessionRequest, 
  AddKeywordRequest, 
  VoteRequest,
  CategoryType,
  ApiError 
} from '../types';

// Hook for creating a new session
export function useCreateSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSession, setUser } = useSessionStore();

  const createSession = useCallback(async (data: CreateSessionRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.createSession(data);
      
      // Set user data
      setUser({
        id: response.userId,
        name: data.creatorName,
        isCreator: true,
      });

      // Get full session data
      const sessionData = await apiService.getSession(response.sessionId);
      setSession(sessionData);

      // Connect to real-time updates
      socketService.connect();
      socketService.joinSession(response.sessionId, response.userId);

      return response;
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setSession, setUser]);

  return { createSession, isLoading, error };
}

// Hook for joining an existing session
export function useJoinSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSession, setUser } = useSessionStore();

  const joinSession = useCallback(async (sessionId: string, data: JoinSessionRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.joinSession(sessionId, data);
      
      // Set user data
      setUser({
        id: response.userId,
        name: data.name,
        isCreator: false,
      });

      // Set session data
      setSession(response.sessionData);

      // Connect to real-time updates
      socketService.connect();
      socketService.joinSession(sessionId, response.userId);

      return response;
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setSession, setUser]);

  return { joinSession, isLoading, error };
}

// Hook for adding keywords
export function useAddKeyword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const user = useUser();

  const addKeyword = useCallback(async (text: string, category: CategoryType) => {
    if (!session || !user) {
      setError('Session or user not found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call API - this will trigger Socket.io events automatically
      await apiService.addKeyword(session.id, {
        userId: user.id,
        text,
        category,
      });

    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [session, user]);

  return { addKeyword, isLoading, error };
}

// Hook for voting
export function useVote() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const user = useUser();

  const vote = useCallback(async (keywordId: string, value: 1 | -1) => {
    if (!session || !user) {
      setError('Session or user not found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call API - this will trigger Socket.io events automatically
      await apiService.vote(session.id, {
        userId: user.id,
        keywordId,
        value,
      });

    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [session, user]);

  return { vote, isLoading, error };
}

// Hook for typing indicators
export function useTyping() {
  const session = useSession();
  const user = useUser();
  const [isTyping, setIsTyping] = useState(false);

  const setTyping = useCallback((typing: boolean) => {
    if (!session || !user) return;

    setIsTyping(typing);
    socketService.setTyping(session.id, user.id, typing);
  }, [session, user]);

  // Auto-clear typing after delay
  useEffect(() => {
    if (!isTyping) return;

    const timer = setTimeout(() => {
      setTyping(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isTyping, setTyping]);

  return { isTyping, setTyping };
}

// Hook for session connection management
export function useSessionConnection() {
  const session = useSession();
  const user = useUser();
  const { isConnected } = useUIState();

  // Auto-connect when session and user are available
  useEffect(() => {
    if (session && user && !isConnected) {
      socketService.connect();
      socketService.joinSession(session.id, user.id);
    }
  }, [session, user, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  return { isConnected };
}

// Hook for session health check
export function useSessionHealth() {
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const healthData = await apiService.healthCheck();
      setHealth(healthData);
      return healthData;
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-check on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return { health, checkHealth, isLoading, error };
}
