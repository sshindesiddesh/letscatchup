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

import { Router, Request, Response } from 'express';
import { sessionManager } from '../services/SessionManager';
import { llmService } from '../services/LLMService';
import {
  broadcastSessionUpdate,
  broadcastKeywordAdded,
  broadcastVoteUpdate,
  broadcastSessionStats
} from '../sockets/sessionSocket';
import {
  CreateSessionRequest,
  CreateSessionResponse,
  JoinSessionRequest,
  JoinSessionResponse,
  AddKeywordRequest,
  VoteRequest,
  DeleteSessionRequest,
  DeleteSessionResponse
} from '../models/types';

// We'll get the io instance from the main server
let socketIO: any = null;
export function setSocketIO(io: any) {
  socketIO = io;
}

export const sessionRouter = Router();

/**
 * Health check for session service
 * GET /api/session/health
 */
sessionRouter.get('/health', (req: Request, res: Response) => {
  const session = sessionManager.session;
  return res.status(200).json({
    status: 'ok',
    hasActiveSession: !!session,
    sessionId: session?.id || null,
    participantCount: session?.participants.size || 0,
    keywordCount: session?.keywords.size || 0
  });
});

/**
 * Get LLM service information
 * GET /api/session/llm-info
 */
sessionRouter.get('/llm-info', (req: Request, res: Response) => {
  const modelInfo = llmService.getModelInfo();
  return res.status(200).json({
    llm: {
      available: modelInfo.available,
      model: modelInfo.name,
      status: modelInfo.available ? 'ready' : 'unavailable'
    },
    features: {
      smartCategorization: modelInfo.available,
      descriptionAnalysis: modelInfo.available,
      fallbackCategorization: true
    }
  });
});

/**
 * Create a new planning session
 * POST /api/session/create
 */
sessionRouter.post('/create', (req: Request<{}, CreateSessionResponse, CreateSessionRequest>, res: Response<CreateSessionResponse>) => {
  try {
    const { description, creatorName } = req.body;

    if (!description || !creatorName) {
      return res.status(400).json({
        error: 'Description and creator name are required'
      } as any);
    }

    if (description.trim().length < 3) {
      return res.status(400).json({
        error: 'Description must be at least 3 characters'
      } as any);
    }

    if (creatorName.trim().length < 1) {
      return res.status(400).json({
        error: 'Creator name is required'
      } as any);
    }

    const { sessionId, userId, userCode } = sessionManager.createSession(
      description.trim(),
      creatorName.trim()
    );

    const response: CreateSessionResponse = {
      sessionId,
      shareLink: `/join/${sessionId}`,
      userId,
      userCode
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(500).json({
      error: 'Failed to create session'
    } as any);
  }
});

/**
 * Create a new planning session with LLM analysis
 * POST /api/session/create-smart
 */
sessionRouter.post('/create-smart', async (req: Request<{}, any, CreateSessionRequest>, res: Response) => {
  try {
    const { description, creatorName } = req.body;

    if (!description || !creatorName) {
      return res.status(400).json({
        error: 'Description and creator name are required'
      });
    }

    if (description.trim().length < 3) {
      return res.status(400).json({
        error: 'Description must be at least 3 characters'
      });
    }

    if (creatorName.trim().length < 1) {
      return res.status(400).json({
        error: 'Creator name is required'
      });
    }

    const result = await sessionManager.createSessionWithLLM(
      description.trim(),
      creatorName.trim()
    );

    const response = {
      sessionId: result.sessionId,
      shareLink: `/join/${result.sessionId}`,
      userId: result.userId,
      userCode: result.userCode,
      analysis: result.analysis
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Error creating smart session:', error);
    return res.status(500).json({
      error: 'Failed to create session'
    });
  }
});

/**
 * Join an existing session
 * POST /api/session/:sessionId/join
 */
sessionRouter.post('/:sessionId/join', (req: Request<{ sessionId: string }, JoinSessionResponse, JoinSessionRequest>, res: Response<JoinSessionResponse>) => {
  try {
    const { sessionId } = req.params;
    const { name } = req.body;

    if (!name || name.trim().length < 1) {
      return res.status(400).json({
        error: 'Name is required'
      } as any);
    }

    const joinResult = sessionManager.joinSession(sessionId, name.trim());

    if (!joinResult.success) {
      return res.status(400).json({
        error: joinResult.error || 'Failed to join session'
      } as any);
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      } as any);
    }

    const response: JoinSessionResponse = {
      userId: joinResult.userId,
      userCode: joinResult.userCode,
      sessionData: sessionManager.serializeSession(session)
    };

    // Broadcast session update to all participants (new user joined)
    if (socketIO) {
      broadcastSessionUpdate(sessionId, socketIO);
      broadcastSessionStats(sessionId, socketIO);
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error joining session:', error);
    return res.status(500).json({
      error: 'Failed to join session'
    } as any);
  }
});

/**
 * Get session data
 * GET /api/session/:sessionId
 */
sessionRouter.get('/:sessionId', (req: Request<{ sessionId: string }>, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    return res.status(200).json(sessionManager.serializeSession(session));
  } catch (error) {
    console.error('Error getting session:', error);
    return res.status(500).json({
      error: 'Failed to get session'
    });
  }
});

/**
 * Delete a session (admin only)
 * DELETE /api/session/:sessionId
 */
sessionRouter.delete('/:sessionId', (req: Request<{ sessionId: string }, DeleteSessionResponse, DeleteSessionRequest>, res: Response<DeleteSessionResponse>) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const deleteResult = sessionManager.deleteSession(sessionId, userId);

    if (!deleteResult.success) {
      return res.status(403).json({
        success: false,
        message: deleteResult.error || 'Failed to delete session'
      });
    }

    // Broadcast session deletion to all participants
    if (socketIO) {
      const session = sessionManager.getSession(sessionId);
      const adminParticipant = session?.participants.get(userId);
      const adminName = adminParticipant?.name || 'Admin';

      socketIO.to(sessionId).emit('session-deleted', {
        message: 'Session has been deleted by the admin',
        adminName
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete session'
    });
  }
});

/**
 * Get current session data (MVP: single session)
 * GET /api/session/current
 */
sessionRouter.get('/current', (req: Request, res: Response) => {
  try {
    const session = sessionManager.getSession('current');

    if (!session) {
      return res.status(404).json({
        error: 'No active session found'
      });
    }

    return res.status(200).json(sessionManager.serializeSession(session));
  } catch (error) {
    console.error('Error getting current session:', error);
    return res.status(500).json({
      error: 'Failed to get current session'
    });
  }
});

/**
 * Rejoin the current session using user code (MVP: single session)
 * POST /api/session/current/rejoin
 */
sessionRouter.post('/current/rejoin', (req: Request<{}, any, { userCode: string }>, res: Response) => {
  try {
    const { userCode } = req.body;

    if (!userCode || userCode.trim().length !== 3) {
      return res.status(400).json({
        error: 'User code is required and must be 3 digits'
      });
    }

    const rejoinResult = sessionManager.rejoinSession('current', userCode.trim());

    if (!rejoinResult.success) {
      return res.status(400).json({
        error: rejoinResult.error || 'Failed to rejoin session'
      });
    }

    const session = sessionManager.getSession('current');
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    const response = {
      userId: rejoinResult.userId,
      userCode: rejoinResult.userCode,
      userData: rejoinResult.userData,
      sessionData: sessionManager.serializeSession(session)
    };

    // Broadcast session update (user rejoined)
    if (socketIO) {
      broadcastSessionUpdate('current', socketIO);
      broadcastSessionStats('current', socketIO);
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error rejoining current session:', error);
    return res.status(500).json({
      error: 'Failed to rejoin session'
    });
  }
});

/**
 * Join the current session (MVP: single session)
 * POST /api/session/current/join
 */
sessionRouter.post('/current/join', (req: Request<{}, JoinSessionResponse, JoinSessionRequest>, res: Response<JoinSessionResponse>) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 1) {
      return res.status(400).json({
        error: 'Name is required'
      } as any);
    }

    const joinResult = sessionManager.joinSession('current', name.trim());

    if (!joinResult.success) {
      return res.status(400).json({
        error: joinResult.error || 'Failed to join session'
      } as any);
    }

    const session = sessionManager.getSession('current');
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      } as any);
    }

    const response: JoinSessionResponse = {
      userId: joinResult.userId,
      userCode: joinResult.userCode,
      sessionData: sessionManager.serializeSession(session)
    };

    // Broadcast session update to all participants (new user joined)
    if (socketIO) {
      broadcastSessionUpdate('current', socketIO);
      broadcastSessionStats('current', socketIO);
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error joining current session:', error);
    return res.status(500).json({
      error: 'Failed to join session'
    } as any);
  }
});

/**
 * Delete current session (admin only)
 * DELETE /api/session/current
 */
sessionRouter.delete('/current', (req: Request<{}, DeleteSessionResponse, DeleteSessionRequest>, res: Response<DeleteSessionResponse>) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const deleteResult = sessionManager.deleteSession('current', userId);

    if (!deleteResult.success) {
      return res.status(403).json({
        success: false,
        message: deleteResult.error || 'Failed to delete session'
      });
    }

    // Broadcast session deletion to all participants
    if (socketIO) {
      const session = sessionManager.getSession('current');
      const adminParticipant = session?.participants.get(userId);
      const adminName = adminParticipant?.name || 'Admin';

      socketIO.to('current').emit('session-deleted', {
        message: 'Session has been deleted by the admin',
        adminName
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting current session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete session'
    });
  }
});

/**
 * Add a keyword to current session (MVP: single session)
 * POST /api/session/current/keywords
 */
sessionRouter.post('/current/keywords', (req: Request<{}, {}, AddKeywordRequest>, res: Response) => {
  try {
    const { userId, text, category } = req.body;

    if (!userId || !text || !category) {
      return res.status(400).json({
        error: 'UserId, text, and category are required'
      });
    }

    if (!['time', 'location', 'food', 'activity'].includes(category)) {
      return res.status(400).json({
        error: 'Category must be one of: time, location, food, activity'
      });
    }

    const keyword = sessionManager.addKeyword('current', userId, text.trim(), category);

    if (!keyword) {
      return res.status(400).json({
        error: 'Failed to add keyword. Check session and user ID.'
      });
    }

    // Broadcast new keyword to all participants
    if (socketIO) {
      broadcastKeywordAdded('current', keyword.id, socketIO);
      broadcastSessionStats('current', socketIO);
    }

    return res.status(201).json({
      id: keyword.id,
      text: keyword.text,
      category: keyword.category,
      addedBy: keyword.addedBy,
      createdAt: keyword.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error adding keyword to current session:', error);
    return res.status(500).json({
      error: 'Failed to add keyword'
    });
  }
});

/**
 * Vote on a keyword in current session (MVP: single session)
 * POST /api/session/current/vote
 */
sessionRouter.post('/current/vote', (req: Request<{}, {}, VoteRequest>, res: Response) => {
  try {
    const { userId, keywordId, value } = req.body;

    if (!userId || !keywordId || (value !== 1 && value !== -1)) {
      return res.status(400).json({
        error: 'UserId, keywordId, and value (1 or -1) are required'
      });
    }

    const result = sessionManager.vote('current', userId, keywordId, value);

    if (!result.success) {
      return res.status(400).json({
        error: result.error || 'Failed to vote'
      });
    }

    // Broadcast vote update to all participants
    if (socketIO) {
      broadcastVoteUpdate('current', keywordId, socketIO);
      broadcastSessionStats('current', socketIO);
    }

    return res.status(200).json({
      keywordId,
      totalScore: result.totalScore,
      votes: result.votes
    });
  } catch (error) {
    console.error('Error voting in current session:', error);
    return res.status(500).json({
      error: 'Failed to vote'
    });
  }
});

/**
 * Add a keyword to the session
 * POST /api/session/:sessionId/keywords
 */
sessionRouter.post('/:sessionId/keywords', (req: Request<{ sessionId: string }, {}, AddKeywordRequest>, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { userId, text, category } = req.body;

    if (!userId || !text || !category) {
      return res.status(400).json({
        error: 'UserId, text, and category are required'
      });
    }

    if (!['time', 'location', 'food', 'activity'].includes(category)) {
      return res.status(400).json({
        error: 'Category must be one of: time, location, food, activity'
      });
    }

    const keyword = sessionManager.addKeyword(sessionId, userId, text.trim(), category);

    if (!keyword) {
      return res.status(400).json({
        error: 'Failed to add keyword. Check session and user ID.'
      });
    }

    // Broadcast new keyword to all participants
    console.log('🔍 Checking socketIO for broadcast:', socketIO ? 'Available' : 'NULL');
    if (socketIO) {
      console.log('📡 Calling broadcastKeywordAdded...');
      broadcastKeywordAdded(sessionId, keyword.id, socketIO);
      broadcastSessionStats(sessionId, socketIO);
    } else {
      console.log('❌ socketIO is null, cannot broadcast');
    }

    return res.status(201).json({
      id: keyword.id,
      text: keyword.text,
      category: keyword.category,
      addedBy: keyword.addedBy,
      createdAt: keyword.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error adding keyword:', error);
    return res.status(500).json({
      error: 'Failed to add keyword'
    });
  }
});

/**
 * Add a keyword with intelligent LLM categorization
 * POST /api/session/:sessionId/keywords-smart
 */
sessionRouter.post('/:sessionId/keywords-smart', async (req: Request<{ sessionId: string }, {}, { userId: string; text: string; suggestedCategory?: string }>, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { userId, text, suggestedCategory } = req.body;

    if (!userId || !text) {
      return res.status(400).json({
        error: 'UserId and text are required'
      });
    }

    if (suggestedCategory && !['time', 'location', 'food', 'activity'].includes(suggestedCategory)) {
      return res.status(400).json({
        error: 'Suggested category must be one of: time, location, food, activity'
      });
    }

    const keyword = await sessionManager.addKeywordWithLLM(
      sessionId,
      userId,
      text.trim(),
      suggestedCategory as any
    );

    if (!keyword) {
      return res.status(400).json({
        error: 'Failed to add keyword. Check session and user ID.'
      });
    }

    // Broadcast new keyword to all participants
    if (socketIO) {
      broadcastKeywordAdded(sessionId, keyword.id, socketIO);
      broadcastSessionStats(sessionId, socketIO);
    }

    return res.status(201).json({
      id: keyword.id,
      text: keyword.text,
      category: keyword.category,
      addedBy: keyword.addedBy,
      createdAt: keyword.createdAt.toISOString(),
      llmCategorized: true
    });
  } catch (error) {
    console.error('Error adding smart keyword:', error);
    return res.status(500).json({
      error: 'Failed to add keyword'
    });
  }
});

/**
 * Vote on a keyword
 * POST /api/session/:sessionId/vote
 */
sessionRouter.post('/:sessionId/vote', (req: Request<{ sessionId: string }, {}, VoteRequest>, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { userId, keywordId, value } = req.body;

    if (!userId || !keywordId || (value !== 1 && value !== -1)) {
      return res.status(400).json({
        error: 'UserId, keywordId, and value (1 or -1) are required'
      });
    }

    const result = sessionManager.vote(sessionId, userId, keywordId, value);

    if (!result.success) {
      return res.status(400).json({
        error: result.error || 'Failed to vote'
      });
    }

    // Broadcast vote update to all participants
    if (socketIO) {
      broadcastVoteUpdate(sessionId, keywordId, socketIO);
      broadcastSessionStats(sessionId, socketIO);
    }

    return res.status(200).json({
      keywordId,
      totalScore: result.totalScore,
      votes: result.votes
    });
  } catch (error) {
    console.error('Error voting:', error);
    return res.status(500).json({
      error: 'Failed to vote'
    });
  }
});

/**
 * Get session participants
 * GET /api/session/:sessionId/participants
 */
sessionRouter.get('/:sessionId/participants', (req: Request<{ sessionId: string }>, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    const participants = Array.from(session.participants.values()).map(p => ({
      id: p.id,
      name: p.name,
      joinedAt: p.joinedAt.toISOString(),
      isCreator: p.isCreator
    }));

    return res.status(200).json({ participants });
  } catch (error) {
    console.error('Error getting participants:', error);
    return res.status(500).json({
      error: 'Failed to get participants'
    });
  }
});


