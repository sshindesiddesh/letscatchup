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

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

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
      
      // Notify others in the session
      socket.to(sessionId).emit('participant-joined', {
        id: participant?.id,
        name: participant?.name,
        joinedAt: participant?.joinedAt.toISOString(),
        isCreator: participant?.isCreator
      });

      // Send current session state to the joining user
      socket.emit('session-updated', sessionManager.serializeSession(session));
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

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
      
      // Find and clean up participant socket ID
      const session = sessionManager.session;
      if (session) {
        for (const [userId, participant] of session.participants) {
          if (participant.socketId === socket.id) {
            delete participant.socketId;
            console.log(`🧹 Cleaned up socket for ${participant.name}`);
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
  io.to(sessionId).emit('consensus-reached', keywordIds);
}
