/**
 * letscatchup.ai - Session Hooks
 * 
 * Custom React hooks for session management and real-time features
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import { useEffect, useCallback, useState, useRef } from 'react';
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
        userCode: response.userCode,
        isCreator: true,
        isAdmin: true, // Creator is admin
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
        userCode: response.userCode,
        isCreator: false,
        isAdmin: false, // Joiners are not admin by default
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
      const response = await apiService.addKeyword(session.id, {
        userId: user.id,
        text,
        category,
      });

      // Immediately update local state (don't wait for Socket.io)
      const { addKeyword: addKeywordToStore } = useSessionStore.getState();
      addKeywordToStore({
        id: response.id,
        text: response.text,
        category: response.category as CategoryType,
        addedBy: response.addedBy,
        createdAt: response.createdAt,
        votes: [],
        totalScore: 0,
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
      // Call API for current session - this will trigger Socket.io events automatically
      const response = await apiService.voteInCurrent({
        userId: user.id,
        keywordId,
        value,
      });

      console.log('✅ Vote response:', response);

      // Immediately update local state (don't wait for Socket.io)
      const { updateKeyword } = useSessionStore.getState();
      updateKeyword(keywordId, {
        totalScore: response.totalScore,
        votes: response.votes.map(vote => ({
          userId: vote.userId,
          value: vote.value as 1 | -1,
          timestamp: vote.timestamp
        })),
      });

    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
      console.error('❌ Vote failed:', error);
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
  const hasJoinedRef = useRef<string | null>(null);

  // Auto-connect when session and user are available
  useEffect(() => {
    if (session && user) {
      console.log('🔍 useSessionConnection - session and user available');
      console.log('🔍 isConnected:', isConnected);

      if (!isConnected) {
        console.log('🔌 Connecting to Socket.io...');
        socketService.connect();
      }
    }
  }, [session, user, isConnected]);

  // Join session when connected (only once per session)
  useEffect(() => {
    if (session && user && isConnected) {
      const sessionKey = `${session.id}-${user.id}`;

      // Only join if we haven't already joined this session with this user
      if (hasJoinedRef.current !== sessionKey) {
        console.log('🔍 Socket connected, joining session...');
        console.log('🔍 Session ID:', session.id);
        console.log('🔍 User ID:', user.id);
        socketService.joinSession(session.id, user.id);
        hasJoinedRef.current = sessionKey;
      }
    } else {
      console.log('🔍 Not joining session - session:', !!session, 'user:', !!user, 'isConnected:', isConnected);
    }
  }, [session, user, isConnected]);

  // Reset join tracking when session changes
  useEffect(() => {
    hasJoinedRef.current = null;
  }, [session?.id]);

  // Reset join tracking on unmount (but don't disconnect - let other components use the connection)
  useEffect(() => {
    return () => {
      hasJoinedRef.current = null;
    };
  }, []);

  return { isConnected };
}

// Hook for deleting sessions (admin only)
export function useDeleteSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const user = useUser();
  const { reset } = useSessionStore();

  const deleteSession = useCallback(async () => {
    if (!session || !user) {
      setError('Session or user not found');
      return;
    }

    if (!user.isAdmin) {
      setError('Only the session admin can delete the session');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiService.deleteCurrentSession({
        userId: user.id,
      });

      // Clear local state
      reset();

      console.log('🗑️ Session deleted successfully');
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [session, user, reset]);

  return { deleteSession, isLoading, error, canDelete: user?.isAdmin || false };
}

// Hook for rejoining sessions with user code
export function useRejoinSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSession, setUser } = useSessionStore();

  const rejoinSession = useCallback(async (userCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.rejoinCurrentSession({ userCode });

      // Set session data
      setSession(response.sessionData);

      // Set user data
      setUser({
        id: response.userId,
        name: response.userData.name,
        userCode: response.userCode,
        isCreator: response.userData.isCreator,
        isAdmin: response.userData.isAdmin,
      });

      console.log(`🔄 Successfully rejoined session with code ${userCode}`);
      return response;
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setSession, setUser]);

  return { rejoinSession, isLoading, error };
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
