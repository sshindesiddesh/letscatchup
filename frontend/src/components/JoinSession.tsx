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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6">
          <div className="card text-center">
            <div className="text-4xl mb-4">😕</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h2>
            <p className="text-gray-600 mb-6">
              {sessionError || 'This session may have expired or the link is invalid.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🤝</div>
                <h1 className="text-xl font-bold text-gray-900">letscatchup.ai</h1>
              </div>
              <div className="text-sm text-gray-500">
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🤝</div>
              <h1 className="text-xl font-bold text-gray-900">letscatchup.ai</h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Create your own session
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">👋</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            You're Invited!
          </h2>
          <p className="text-lg text-gray-600">
            Join the planning session for:
          </p>
        </div>

        {/* Session Info */}
        <div className="card mb-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              "{sessionData.description}"
            </h3>
            
            <div className="flex justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="mr-1">👥</span>
                {sessionData.participants.length} participant{sessionData.participants.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center">
                <span className="mr-1">💡</span>
                {sessionData.keywords.length} idea{sessionData.keywords.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center">
                <span className="mr-1">🗳️</span>
                {sessionData.keywords.reduce((sum, k) => sum + k.votes.length, 0)} votes
              </div>
            </div>
          </div>
        </div>

        {/* Participants Preview */}
        {sessionData.participants.length > 0 && (
          <div className="card mb-8">
            <h4 className="font-semibold mb-3">Who's already planning:</h4>
            <div className="flex flex-wrap gap-2">
              {sessionData.participants.map(participant => (
                <div key={participant.id} className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-xs">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{participant.name}</span>
                  {participant.isCreator && (
                    <span className="text-xs text-gray-500">(creator)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Ideas Preview */}
        {sessionData.keywords.length > 0 && (
          <div className="card mb-8">
            <h4 className="font-semibold mb-3">Recent ideas:</h4>
            <div className="space-y-2">
              {sessionData.keywords
                .slice(-3)
                .reverse()
                .map(keyword => (
                  <div key={keyword.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{keyword.text}</span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span>👍 {keyword.votes.filter(v => v.value === 1).length}</span>
                      <span>👎 {keyword.votes.filter(v => v.value === -1).length}</span>
                    </div>
                  </div>
                ))}
              {sessionData.keywords.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  +{sessionData.keywords.length - 3} more ideas
                </p>
              )}
            </div>
          </div>
        )}

        {/* Join Mode Selection */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How would you like to join?</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setJoinMode('new')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  joinMode === 'new'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">👋 New Participant</div>
                <div className="text-sm text-gray-600 mt-1">Join for the first time</div>
              </button>
              <button
                onClick={() => setJoinMode('rejoin')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  joinMode === 'rejoin'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">🔄 Returning User</div>
                <div className="text-sm text-gray-600 mt-1">I have a 3-digit code</div>
              </button>
            </div>
          </div>

          {/* New User Form */}
          {joinMode === 'new' && (
            <form onSubmit={handleJoin} className="space-y-6">
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
                  className="input-field"
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
                className="btn-primary w-full text-lg py-3"
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
            <form onSubmit={handleRejoin} className="space-y-6">
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
                  className="input-field text-center text-2xl font-mono tracking-widest"
                  maxLength={3}
                  pattern="[0-9]{3}"
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is the 3-digit code you received when you first joined
                </p>
              </div>

              {rejoinError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{rejoinError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isRejoining || userCode.length !== 3}
                className="btn-primary w-full text-lg py-3"
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

        {/* What Happens Next */}
        <div className="mt-8 text-center">
          <h4 className="font-semibold text-gray-900 mb-4">What happens next?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">💡</span>
              </div>
              <p className="font-medium">Add Ideas</p>
              <p className="text-gray-600">Suggest times, places, activities</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">🗳️</span>
              </div>
              <p className="font-medium">Vote Together</p>
              <p className="text-gray-600">Show preferences in real-time</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">🎯</span>
              </div>
              <p className="font-medium">Reach Consensus</p>
              <p className="text-gray-600">Find the perfect plan together</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinSession;
