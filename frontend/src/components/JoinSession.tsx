/**
 * letscatchup.ai - Join Session Component
 * 
 * Friend onboarding flow for joining existing meetup planning sessions
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJoinSession, useRejoinSession, useAddKeyword } from '../hooks/useSession';
import { useSessionStore } from '../store/sessionStore';
import { apiService } from '../services/apiService';
import OnboardingFlow, { OnboardingResponses } from './OnboardingFlow';
import type { SessionData } from '../types';

export function JoinSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { joinSession, isLoading, error } = useJoinSession();
  const { rejoinSession, isLoading: isRejoining, error: rejoinError } = useRejoinSession();
  const { addKeyword } = useAddKeyword();
  const { setOnboardingResponse } = useSessionStore();

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [userCode, setUserCode] = useState('');
  const [joinMode, setJoinMode] = useState<'new' | 'rejoin'>('new');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingResponses, setOnboardingResponses] = useState<OnboardingResponses | null>(null);

  // Load session data on mount
  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    const loadSession = async () => {
      try {
        const data = await apiService.getSession(sessionId);
        setSessionData(data);
      } catch (err: any) {
        setSessionError(err.message || 'Session not found');
      } finally {
        setLoadingSession(false);
      }
    };

    loadSession();
  }, [sessionId, navigate]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !sessionId) return;

    try {
      await joinSession(sessionId, { name: name.trim() });

      // Show onboarding flow after successful join
      setShowOnboarding(true);
    } catch (err) {
      console.error('Failed to join session:', err);
    }
  };

  const handleRejoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userCode.trim() || userCode.trim().length !== 3) {
      return;
    }

    try {
      await rejoinSession(userCode.trim());

      // Navigate directly to session (no onboarding for returning users)
      navigate(`/session/${sessionId}`);
    } catch (err) {
      console.error('Failed to rejoin session:', err);
    }
  };

  const handleOnboardingComplete = async (responses: OnboardingResponses) => {
    setOnboardingResponses(responses);

    // Save responses to store (we'll need the user ID from the join response)
    // For now, we'll save it with a temporary key and update it later
    setOnboardingResponse('temp', responses);

    // Add initial suggestions from onboarding
    if (responses.initialSuggestions.length > 0) {
      try {
        for (const suggestion of responses.initialSuggestions) {
          await addKeyword(suggestion.text, suggestion.category);
        }
      } catch (error) {
        console.error('Failed to add initial suggestions:', error);
      }
    }

    // Navigate to session
    navigate(`/session/${sessionId}`);
  };

  const handleSkipOnboarding = () => {
    navigate(`/session/${sessionId}`);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (sessionError || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
            <div className="text-4xl mb-4">😕</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h2>
            <p className="text-gray-600 mb-6">
              {sessionError || 'This session may have expired or the link is invalid.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Create New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding flow after successful join
  if (showOnboarding && sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-center sm:justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-xl sm:text-2xl">🤝</div>
                <h1 className="text-xl sm:text-2xl font-bold text-blue-600" style={{ fontFamily: 'cursive' }}>
                  letscatchup
                </h1>
              </div>
              <div className="text-sm text-gray-500 hidden sm:block">
                Welcome to "{sessionData.description}"
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Content */}
        <div className="px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome, {name}! 👋
            </h2>
            <p className="text-lg text-gray-600">
              Let's personalize your experience and help you contribute to the planning
            </p>
          </div>

          <OnboardingFlow
            sessionData={sessionData}
            onComplete={handleOnboardingComplete}
            onSkip={handleSkipOnboarding}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-xl sm:text-2xl">🤝</div>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600" style={{ fontFamily: 'cursive' }}>
                letscatchup
              </h1>
            </div>
            <div className="text-sm text-gray-500 hidden sm:block">
              Collaborative meetup planning
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6">
        <div className="w-full max-w-2xl">

          {/* You're invited section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-4xl sm:text-5xl mb-6">👋</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8 sm:mb-12">
              You're Invited! Join the planning session for: "{sessionData.description}"
            </h2>
          </div>

          {/* How it works section */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-lg sm:text-2xl">💡</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Add Ideas</h3>
                <p className="text-xs sm:text-sm text-gray-600">Suggest times, places, activities</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-lg sm:text-2xl">🗳️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Vote Together</h3>
                <p className="text-xs sm:text-sm text-gray-600">Show preferences in real-time</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-lg sm:text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Reach Consensus</h3>
                <p className="text-xs sm:text-sm text-gray-600">Find the perfect plan together</p>
              </div>
            </div>
          </div>

          {/* Join Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 text-center">How would you like to join?</h3>

            {/* Join Mode Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setJoinMode('new')}
                className={`p-4 sm:p-6 border-2 rounded-lg text-left transition-all duration-200 ${
                  joinMode === 'new'
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="font-semibold text-gray-900 text-base sm:text-lg mb-2">👋 New Participant</div>
                <div className="text-sm text-gray-600">Join for the first time</div>
              </button>
              <button
                onClick={() => setJoinMode('rejoin')}
                className={`p-4 sm:p-6 border-2 rounded-lg text-left transition-all duration-200 ${
                  joinMode === 'rejoin'
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="font-semibold text-gray-900 text-base sm:text-lg mb-2">🔄 Returning User</div>
                <div className="text-sm text-gray-600">I have a 3-digit code</div>
              </button>
            </div>

            {/* New User Form */}
            {joinMode === 'new' && (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    What should we call you?
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Joining session...
                    </span>
                  ) : (
                    'Join Planning Session'
                  )}
                </button>
              </form>
            )}

            {/* Rejoin Form */}
            {joinMode === 'rejoin' && (
              <form onSubmit={handleRejoin} className="space-y-4">
                <div>
                  <label htmlFor="userCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your 3-digit code
                  </label>
                  <input
                    id="userCode"
                    type="text"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="123"
                    className="w-full px-4 py-4 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                    maxLength={3}
                    pattern="[0-9]{3}"
                    required
                    autoFocus
                  />
                </div>

                {rejoinError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{rejoinError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRejoining || userCode.length !== 3}
                  className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {isRejoining ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Rejoining session...
                    </span>
                  ) : (
                    'Rejoin Session'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinSession;
