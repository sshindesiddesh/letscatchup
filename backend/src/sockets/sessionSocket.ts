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

import { Server, Socket } from 'socket.io';
import { sessionManager } from '../services/SessionManager';

// Store socket connections for broadcasting
const connectedSockets = new Map<string, Socket>();

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Store socket connection
    connectedSockets.set(socket.id, socket);

    // Join a session room for real-time updates
    socket.on('join-session', (data: { sessionId: string; userId: string }) => {
      const { sessionId, userId } = data;

      // Verify session and user exist
      const session = sessionManager.getSession(sessionId);
      if (!session || !session.participants.has(userId)) {
        socket.emit('error', { message: 'Invalid session or user' });
        return;
      }

      // Join the session room
      socket.join(sessionId);

      // Update participant with socket ID for tracking
      const participant = session.participants.get(userId);
      if (participant) {
        participant.socketId = socket.id;
      }

      console.log(`👋 ${participant?.name} joined session room: ${sessionId}`);

      // Notify others in the session that someone joined
      socket.to(sessionId).emit('participant-joined', {
        id: participant?.id,
        name: participant?.name,
        joinedAt: participant?.joinedAt.toISOString(),
        isCreator: participant?.isCreator
      });

      // Send current session state to the joining user
      socket.emit('session-updated', sessionManager.serializeSession(session));

      // Broadcast updated participant count to all users in session
      broadcastParticipantCount(sessionId, io);
    });

    // Leave a session room
    socket.on('leave-session', (data: { sessionId: string; userId: string }) => {
      const { sessionId, userId } = data;
      
      socket.leave(sessionId);
      
      const session = sessionManager.getSession(sessionId);
      const participant = session?.participants.get(userId);
      
      console.log(`👋 ${participant?.name} left session room: ${sessionId}`);
      
      // Notify others in the session
      socket.to(sessionId).emit('participant-left', userId);
    });

    // Handle real-time keyword addition
    socket.on('add-keyword', (data: { sessionId: string; userId: string; text: string; category: string }) => {
      const { sessionId, userId, text, category } = data;

      // Validate category
      if (!['time', 'location', 'food', 'activity'].includes(category)) {
        socket.emit('error', { message: 'Invalid category' });
        return;
      }

      // Add keyword using session manager
      const keyword = sessionManager.addKeyword(sessionId, userId, text, category as any);
      if (keyword) {
        // Broadcast new keyword to all participants
        broadcastKeywordAdded(sessionId, keyword.id, io);
        console.log(`📡 Broadcasted new keyword: "${text}" to session ${sessionId}`);
      } else {
        socket.emit('error', { message: 'Failed to add keyword' });
      }
    });

    // Handle real-time voting
    socket.on('vote', (data: { sessionId: string; userId: string; keywordId: string; value: number }) => {
      const { sessionId, userId, keywordId, value } = data;

      // Validate vote value
      if (value !== 1 && value !== -1) {
        socket.emit('error', { message: 'Vote value must be 1 or -1' });
        return;
      }

      // Submit vote using session manager
      const success = sessionManager.vote(sessionId, userId, keywordId, value);
      if (success) {
        // Broadcast vote update to all participants
        broadcastVoteUpdate(sessionId, keywordId, io);

        // Check if consensus was reached and broadcast if so
        const session = sessionManager.getSession(sessionId);
        if (session) {
          const keyword = session.keywords.get(keywordId);
          if (keyword && session.consensus.finalized.includes(keywordId)) {
            broadcastConsensusReached(sessionId, [keywordId], io);
          }
        }

        console.log(`📡 Broadcasted vote update for keyword ${keywordId} in session ${sessionId}`);
      } else {
        socket.emit('error', { message: 'Failed to submit vote' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data: { sessionId: string; userId: string; isTyping: boolean }) => {
      const { sessionId, userId, isTyping } = data;

      // Broadcast typing status to others in the session
      socket.to(sessionId).emit('user-typing', {
        userId,
        isTyping,
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);

      // Remove from connected sockets
      connectedSockets.delete(socket.id);

      // Find and clean up participant socket ID
      const session = sessionManager.session;
      if (session) {
        for (const [userId, participant] of session.participants) {
          if (participant.socketId === socket.id) {
            delete participant.socketId;
            console.log(`🧹 Cleaned up socket for ${participant.name}`);

            // Notify others that user went offline
            socket.to(session.id).emit('participant-offline', {
              userId,
              name: participant.name
            });

            // Update participant count
            broadcastParticipantCount(session.id, io);
            break;
          }
        }
      }
    });

    // Test event for debugging
    socket.on('test-message', (data) => {
      console.log('Received test message:', data);
      socket.broadcast.emit('test-response', {
        message: 'Hello from server!',
        timestamp: new Date().toISOString()
      });
    });
  });
}

/**
 * Broadcast session updates to all participants
 */
export function broadcastSessionUpdate(sessionId: string, io: Server) {
  const session = sessionManager.getSession(sessionId);
  if (!session) return;

  const sessionData = sessionManager.serializeSession(session);
  io.to(sessionId).emit('session-updated', sessionData);
}

/**
 * Broadcast when a new keyword is added
 */
export function broadcastKeywordAdded(sessionId: string, keywordId: string, io: Server) {
  const session = sessionManager.getSession(sessionId);
  if (!session) return;

  const keyword = session.keywords.get(keywordId);
  if (!keyword) return;

  const keywordData = {
    id: keyword.id,
    text: keyword.text,
    category: keyword.category,
    votes: Array.from(keyword.votes.values()).map(vote => ({
      userId: vote.userId,
      value: vote.value,
      timestamp: vote.timestamp.toISOString()
    })),
    totalScore: keyword.totalScore,
    addedBy: keyword.addedBy,
    createdAt: keyword.createdAt.toISOString()
  };

  io.to(sessionId).emit('keyword-added', keywordData);
}

/**
 * Broadcast when votes are updated
 */
export function broadcastVoteUpdate(sessionId: string, keywordId: string, io: Server) {
  const session = sessionManager.getSession(sessionId);
  if (!session) return;

  const keyword = session.keywords.get(keywordId);
  if (!keyword) return;

  const voteData = {
    keywordId: keyword.id,
    votes: Array.from(keyword.votes.values()).map(vote => ({
      userId: vote.userId,
      value: vote.value,
      timestamp: vote.timestamp.toISOString()
    })),
    totalScore: keyword.totalScore
  };

  io.to(sessionId).emit('vote-updated', voteData);
}

/**
 * Broadcast when consensus is reached
 */
export function broadcastConsensusReached(sessionId: string, keywordIds: string[], io: Server) {
  const session = sessionManager.getSession(sessionId);
  if (!session) return;

  // Get the keywords that reached consensus
  const consensusKeywords = keywordIds.map(id => {
    const keyword = session.keywords.get(id);
    return keyword ? {
      id: keyword.id,
      text: keyword.text,
      category: keyword.category,
      totalScore: keyword.totalScore
    } : null;
  }).filter(Boolean);

  io.to(sessionId).emit('consensus-reached', {
    keywordIds,
    keywords: consensusKeywords,
    timestamp: new Date().toISOString()
  });

  console.log(`🎯 Consensus reached on ${keywordIds.length} keywords in session ${sessionId}`);
}

/**
 * Broadcast participant count update
 */
export function broadcastParticipantCount(sessionId: string, io: Server) {
  const session = sessionManager.getSession(sessionId);
  if (!session) return;

  const onlineCount = Array.from(session.participants.values())
    .filter(p => p.socketId && connectedSockets.has(p.socketId)).length;

  io.to(sessionId).emit('participant-count-updated', {
    total: session.participants.size,
    online: onlineCount,
    timestamp: new Date().toISOString()
  });
}

/**
 * Broadcast session statistics
 */
export function broadcastSessionStats(sessionId: string, io: Server) {
  const session = sessionManager.getSession(sessionId);
  if (!session) return;

  const stats = {
    participants: session.participants.size,
    keywords: session.keywords.size,
    votes: Array.from(session.keywords.values()).reduce((total, keyword) => total + keyword.votes.size, 0),
    consensus: session.consensus.finalized.length,
    categories: {
      time: Array.from(session.keywords.values()).filter(k => k.category === 'time').length,
      location: Array.from(session.keywords.values()).filter(k => k.category === 'location').length,
      food: Array.from(session.keywords.values()).filter(k => k.category === 'food').length,
      activity: Array.from(session.keywords.values()).filter(k => k.category === 'activity').length,
    }
  };

  io.to(sessionId).emit('session-stats-updated', {
    stats,
    timestamp: new Date().toISOString()
  });
}

/**
 * Get all connected sockets for debugging
 */
export function getConnectedSocketsCount(): number {
  return connectedSockets.size;
}

/**
 * Broadcast to all connected sockets (for system messages)
 */
export function broadcastSystemMessage(message: string, io: Server) {
  io.emit('system-message', {
    message,
    timestamp: new Date().toISOString()
  });
}
