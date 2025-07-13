/**
 * letscatchup.ai - Socket.io Service
 * 
 * Real-time communication service for live collaboration
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import { io, Socket } from 'socket.io-client';
import type { 
  ClientToServerEvents, 
  ServerToClientEvents,
  SessionData,
  ParticipantData,
  KeywordData
} from '../types';
import { useSessionStore, sessionActions } from '../store/sessionStore';

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.setupEventListeners();
  }

  // Connect to Socket.io server
  connect() {
    if (this.socket?.connected) return;

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.setupSocketEventListeners();
    
    console.log('🔌 Connecting to Socket.io server...');
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      useSessionStore.getState().setConnected(false);
      console.log('🔌 Disconnected from Socket.io server');
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Join session room
  joinSession(sessionId: string, userId: string) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot join session');
      return;
    }

    this.socket.emit('join-session', { sessionId, userId });
    console.log(`👋 Joining session: ${sessionId}`);
  }

  // Add keyword via socket
  addKeyword(sessionId: string, userId: string, text: string, category: string) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot add keyword');
      return;
    }

    this.socket.emit('add-keyword', { sessionId, userId, text, category });
    console.log(`💡 Adding keyword: "${text}" (${category})`);
  }

  // Vote via socket
  vote(sessionId: string, userId: string, keywordId: string, value: number) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot vote');
      return;
    }

    this.socket.emit('vote', { sessionId, userId, keywordId, value });
    console.log(`🗳️ Voting ${value > 0 ? '+1' : '-1'} on keyword: ${keywordId}`);
  }

  // Send typing indicator
  setTyping(sessionId: string, userId: string, isTyping: boolean) {
    if (!this.socket?.connected) return;

    this.socket.emit('typing', { sessionId, userId, isTyping });
  }

  // Setup socket event listeners
  private setupSocketEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.io server:', this.socket?.id);
      useSessionStore.getState().setConnected(true);
      useSessionStore.getState().setError(null);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.io server:', reason);
      useSessionStore.getState().setConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error);
      useSessionStore.getState().setError('Connection failed. Retrying...');
      this.handleReconnection();
    });

    // Session events
    this.socket.on('session-updated', (sessionData: SessionData) => {
      console.log('📊 Session updated:', sessionData.id);
      useSessionStore.getState().setSession(sessionData);
    });

    this.socket.on('participant-joined', (participant: ParticipantData) => {
      console.log('👋 Participant joined:', participant.name);
      useSessionStore.getState().addParticipant(participant);
    });

    this.socket.on('participant-offline', (data) => {
      console.log('👋 Participant went offline:', data.name);
      // Could update participant status if we track online/offline
    });

    this.socket.on('participant-count-updated', (data) => {
      console.log('📊 Participant count updated:', data);
      // Could update UI with online count
    });

    // Keyword events
    this.socket.on('keyword-added', (data) => {
      console.log('💡 New keyword added:', data.keyword.text);
      useSessionStore.getState().addKeyword(data.keyword);
    });

    this.socket.on('vote-updated', (data) => {
      console.log('🗳️ Vote updated:', data.keywordId, 'Score:', data.totalScore);
      
      // Update keyword with new vote data
      const { session } = useSessionStore.getState();
      if (session) {
        const keyword = session.keywords.find(k => k.id === data.keywordId);
        if (keyword) {
          useSessionStore.getState().updateKeyword(data.keywordId, {
            totalScore: data.totalScore,
          });
        }
      }
    });

    this.socket.on('consensus-reached', (data) => {
      console.log('🎯 Consensus reached!', data.keywords);
      sessionActions.handleConsensusReached(data.keywordIds);
    });

    this.socket.on('session-stats-updated', (data) => {
      console.log('📈 Session stats updated:', data.stats);
      // Could update UI with session statistics
    });

    // Typing indicators
    this.socket.on('user-typing', (data) => {
      const { typingUsers, setTypingUsers } = useSessionStore.getState().ui;
      
      if (data.isTyping) {
        // Add user to typing list
        if (!typingUsers.includes(data.userId)) {
          setTypingUsers([...typingUsers, data.userId]);
        }
      } else {
        // Remove user from typing list
        setTypingUsers(typingUsers.filter(id => id !== data.userId));
      }
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('🚨 Socket error:', error.message);
      useSessionStore.getState().setError(error.message);
    });

    this.socket.on('system-message', (data) => {
      console.log('📢 System message:', data.message);
      // Could show system notifications
    });
  }

  // Handle reconnection logic
  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      useSessionStore.getState().setError('Connection lost. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    
    setTimeout(() => {
      console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.connect();
    }, delay);
  }

  // Setup store event listeners
  private setupEventListeners() {
    // Listen for store changes that might need socket actions
    // This could be used for auto-reconnection or other reactive behaviors
  }
}

// Create singleton instance
export const socketService = new SocketService();

// Export for use in components
export default socketService;
