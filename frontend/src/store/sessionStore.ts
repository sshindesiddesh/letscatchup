/**
 * letscatchup.ai - Session State Management
 * 
 * Zustand store for managing session data, user state, and UI state
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  SessionStore, 
  SessionData, 
  User, 
  UIState, 
  KeywordData, 
  ParticipantData 
} from '../types';

// Initial UI state
const initialUIState: UIState = {
  isLoading: false,
  error: null,
  isConnected: false,
  typingUsers: [],
};

// Create the session store
export const useSessionStore = create<SessionStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        session: null,
        user: null,
        ui: initialUIState,

        // Session actions
        setSession: (session: SessionData) => {
          set(
            (state) => ({
              session,
              ui: { ...state.ui, isLoading: false, error: null },
            }),
            false,
            'setSession'
          );
        },

        setUser: (user: User) => {
          set(
            { user },
            false,
            'setUser'
          );
        },

        // Keyword actions
        updateKeyword: (keywordId: string, updates: Partial<KeywordData>) => {
          set(
            (state) => {
              if (!state.session) return state;

              const updatedKeywords = state.session.keywords.map(keyword =>
                keyword.id === keywordId ? { ...keyword, ...updates } : keyword
              );

              return {
                session: {
                  ...state.session,
                  keywords: updatedKeywords,
                },
              };
            },
            false,
            'updateKeyword'
          );
        },

        addKeyword: (keyword: KeywordData) => {
          set(
            (state) => {
              if (!state.session) return state;

              return {
                session: {
                  ...state.session,
                  keywords: [...state.session.keywords, keyword],
                },
              };
            },
            false,
            'addKeyword'
          );
        },

        // Participant actions
        updateParticipant: (participantId: string, updates: Partial<ParticipantData>) => {
          set(
            (state) => {
              if (!state.session) return state;

              const updatedParticipants = state.session.participants.map(participant =>
                participant.id === participantId ? { ...participant, ...updates } : participant
              );

              return {
                session: {
                  ...state.session,
                  participants: updatedParticipants,
                },
              };
            },
            false,
            'updateParticipant'
          );
        },

        addParticipant: (participant: ParticipantData) => {
          set(
            (state) => {
              if (!state.session) return state;

              // Check if participant already exists
              const exists = state.session.participants.some(p => p.id === participant.id);
              if (exists) return state;

              return {
                session: {
                  ...state.session,
                  participants: [...state.session.participants, participant],
                },
              };
            },
            false,
            'addParticipant'
          );
        },

        // UI actions
        setLoading: (isLoading: boolean) => {
          set(
            (state) => ({
              ui: { ...state.ui, isLoading },
            }),
            false,
            'setLoading'
          );
        },

        setError: (error: string | null) => {
          set(
            (state) => ({
              ui: { ...state.ui, error, isLoading: false },
            }),
            false,
            'setError'
          );
        },

        setConnected: (isConnected: boolean) => {
          set(
            (state) => ({
              ui: { ...state.ui, isConnected },
            }),
            false,
            'setConnected'
          );
        },

        setTypingUsers: (typingUsers: string[]) => {
          set(
            (state) => ({
              ui: { ...state.ui, typingUsers },
            }),
            false,
            'setTypingUsers'
          );
        },

        // Reset store
        reset: () => {
          set(
            {
              session: null,
              user: null,
              ui: initialUIState,
            },
            false,
            'reset'
          );
        },
      }),
      {
        name: 'letscatchup-session',
        partialize: (state) => ({
          // Only persist user data, not session data (for security)
          user: state.user,
        }),
      }
    ),
    {
      name: 'SessionStore',
    }
  )
);

// Selector hooks for better performance
export const useSession = () => useSessionStore((state) => state.session);
export const useUser = () => useSessionStore((state) => state.user);
export const useUIState = () => useSessionStore((state) => state.ui);

// Computed selectors
export const useSessionStats = () => {
  return useSessionStore((state) => {
    if (!state.session) return null;

    const { keywords, participants } = state.session;
    const totalVotes = keywords.reduce((sum, keyword) => sum + keyword.votes.length, 0);
    const consensusCount = state.session.consensus.finalized.length;

    return {
      participantCount: participants.length,
      keywordCount: keywords.length,
      totalVotes,
      consensusCount,
      categoryCounts: {
        time: keywords.filter(k => k.category === 'time').length,
        location: keywords.filter(k => k.category === 'location').length,
        food: keywords.filter(k => k.category === 'food').length,
        activity: keywords.filter(k => k.category === 'activity').length,
      },
    };
  });
};

export const useKeywordsByCategory = () => {
  return useSessionStore((state) => {
    if (!state.session) return {};

    const keywords = state.session.keywords;
    return {
      time: keywords.filter(k => k.category === 'time'),
      location: keywords.filter(k => k.category === 'location'),
      food: keywords.filter(k => k.category === 'food'),
      activity: keywords.filter(k => k.category === 'activity'),
    };
  });
};

export const useUserVotes = () => {
  return useSessionStore((state) => {
    if (!state.session || !state.user) return {};

    const userVotes: Record<string, number> = {};
    
    state.session.keywords.forEach(keyword => {
      const userVote = keyword.votes.find(vote => vote.userId === state.user!.id);
      if (userVote) {
        userVotes[keyword.id] = userVote.value;
      }
    });

    return userVotes;
  });
};

// Action creators for complex operations
export const sessionActions = {
  // Update keyword vote
  updateKeywordVote: (keywordId: string, userId: string, value: number) => {
    const { session, updateKeyword } = useSessionStore.getState();
    if (!session) return;

    const keyword = session.keywords.find(k => k.id === keywordId);
    if (!keyword) return;

    // Update or add vote
    const existingVoteIndex = keyword.votes.findIndex(vote => vote.userId === userId);
    const newVotes = [...keyword.votes];

    if (existingVoteIndex >= 0) {
      newVotes[existingVoteIndex] = {
        ...newVotes[existingVoteIndex],
        value: value as 1 | -1,
        timestamp: new Date().toISOString(),
      };
    } else {
      newVotes.push({
        userId,
        value: value as 1 | -1,
        timestamp: new Date().toISOString(),
      });
    }

    // Recalculate total score
    const totalScore = newVotes.reduce((sum, vote) => sum + vote.value, 0);

    updateKeyword(keywordId, {
      votes: newVotes,
      totalScore,
    });
  },

  // Handle consensus reached
  handleConsensusReached: (keywordIds: string[]) => {
    const { session, setSession } = useSessionStore.getState();
    if (!session) return;

    const updatedConsensus = {
      ...session.consensus,
      finalized: [...new Set([...session.consensus.finalized, ...keywordIds])],
      pending: session.consensus.pending.filter(id => !keywordIds.includes(id)),
    };

    setSession({
      ...session,
      consensus: updatedConsensus,
    });
  },
};
