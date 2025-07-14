/**
 * letscatchup.ai - Session Page Component
 * 
 * Main collaborative interface for active meetup planning sessions
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession, useUser, useSessionStats, useSessionStore } from '../store/sessionStore';
import { useAddKeyword, useVote, useSessionConnection, useDeleteSession } from '../hooks/useSession';
import { getCategoryInfo, getAllCategories, suggestCategory } from '../utils/categories';
import { ConnectionStatus } from './ConnectionStatus';
import { apiService } from '../services/apiService';
import type { CategoryType } from '../types';

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const session = useSession();
  const user = useUser();
  const stats = useSessionStats();
  const { setSession } = useSessionStore();

  const { addKeyword, isLoading: isAddingKeyword } = useAddKeyword();
  const { vote, isLoading: isVoting } = useVote();
  const { deleteSession, isLoading: isDeletingSession, canDelete } = useDeleteSession();

  // Establish Socket.io connection for real-time updates
  const { isConnected } = useSessionConnection();

  const [newKeyword, setNewKeyword] = useState({
    text: '',
    category: 'activity' as CategoryType,
  });


  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch session data if not in store
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!session && sessionId && user) {
        console.log('🔄 Fetching session data for:', sessionId);
        setIsLoadingSession(true);
        try {
          const sessionData = await apiService.getSession(sessionId);
          console.log('✅ Session data fetched:', sessionData);

          // Check if user is a participant in the session
          const isParticipant = sessionData.participants.some(p => p.id === user.id);
          if (!isParticipant) {
            console.log('🚫 User is not a participant, redirecting to join page');
            navigate(`/join/${sessionId}`);
            return;
          }

          setSession(sessionData);
        } catch (error) {
          console.error('❌ Failed to fetch session data:', error);
          navigate('/');
        } finally {
          setIsLoadingSession(false);
        }
      }
    };

    fetchSessionData();
  }, [session, sessionId, user, setSession, navigate]);

  // Check if user is participant and redirect if needed
  useEffect(() => {
    if (!isLoadingSession && session && user) {
      const isParticipant = session.participants.some(p => p.id === user.id);
      if (!isParticipant) {
        console.log('🚫 User is not a participant, redirecting to join page');
        navigate(`/join/${session.id}`);
        return;
      }
    }

    // Redirect if no session or user
    if (!isLoadingSession && (!session || !user)) {
      navigate('/');
    }
  }, [session, user, navigate, isLoadingSession]);

  if (isLoadingSession || !session || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('🎯 SessionPage render - Session:', session);
  console.log('🎯 SessionPage render - Keywords count:', session.keywords?.length || 0);
  console.log('🎯 SessionPage render - Keywords:', session.keywords);

  const handleAddKeyword = async () => {
    if (!newKeyword.text.trim()) return;

    try {
      await addKeyword(newKeyword.text.trim(), newKeyword.category);
      setNewKeyword({ text: '', category: 'activity' });
    } catch (error) {
      console.error('Failed to add keyword:', error);
    }
  };

  const handleVote = async (keywordId: string, value: 1 | -1) => {
    console.log('🗳️ Voting on keyword:', keywordId, 'with value:', value);
    try {
      await vote(keywordId, value);
      console.log('✅ Vote successful');
    } catch (error) {
      console.error('❌ Failed to vote:', error);
    }
  };

  const handleKeywordTextChange = (text: string) => {
    const suggestedCategory = suggestCategory(text);
    setNewKeyword({
      text,
      category: suggestedCategory,
    });
  };

  const shareLink = `${window.location.origin}/join/${sessionId}`;

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleDeleteSession = async () => {
    try {
      await deleteSession();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{session.description}</h1>
                <p className="text-sm text-gray-500">
                  {stats?.participantCount} participants • {stats?.keywordCount} ideas • {stats?.totalVotes} votes
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Code Display */}
              {user && (
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    {user.isAdmin && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        👑 Admin
                      </span>
                    )}
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">Code: {user.userCode}</div>
                      <div className="text-xs text-gray-500">Remember this!</div>
                    </div>
                  </div>
                </div>
              )}

              <ConnectionStatus />

              <button
                onClick={copyShareLink}
                className="btn-secondary text-sm"
              >
                📋 Copy invite link
              </button>

              {/* Admin Delete Button */}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-danger text-sm"
                  disabled={isDeletingSession}
                >
                  🗑️ Delete Session
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Message Input Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 p-4">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newKeyword.text}
              onChange={(e) => handleKeywordTextChange(e.target.value)}
              placeholder="Type your message or idea..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
            />
            <button
              onClick={handleAddKeyword}
              disabled={isAddingKeyword || !newKeyword.text.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingKeyword ? '...' : 'Send'}
            </button>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-280px)]">
          {/* Left: Chat History */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Messages</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ maxHeight: 'calc(100vh - 320px)' }}>
              {session.keywords.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-2xl mb-2">💬</div>
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">Start the conversation!</p>
                </div>
              ) : (
                session.keywords
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map(keyword => {
                    const author = session.participants.find(p => p.id === keyword.addedBy);
                    return (
                      <div key={keyword.id} className="flex space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-medium text-sm">
                            {author?.name.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{author?.name || 'Unknown'}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(keyword.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{keyword.text}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {keyword.votes.filter(v => v.value === 1).length} votes
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Center: Visual Voting Board */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Ideas Board</h3>
              <p className="text-sm text-gray-500">
                Click to vote • Size shows popularity
                {session.keywords.length > 10 && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    Showing top 10 of {session.keywords.length}
                  </span>
                )}
              </p>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              {session.keywords.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <div className="text-4xl mb-4">💡</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas yet</h3>
                    <p className="text-gray-600">Send your first message to get started!</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 justify-center items-center h-full">
                  {session.keywords
                    .sort((a, b) => {
                      // Sort by votes (descending), then by creation time (latest first) for ties
                      if (b.totalScore !== a.totalScore) {
                        return b.totalScore - a.totalScore;
                      }
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .slice(0, 10) // Limit to top 10 ideas
                    .map(keyword => {
                      const userVote = keyword.votes.find(vote => vote.userId === user.id);
                      const voteCount = keyword.votes.filter(v => v.value === 1).length;

                      // Calculate size based on votes (min 120px, max 240px)
                      const baseSize = 120;
                      const maxSize = 240;
                      const sizeIncrement = Math.min(voteCount * 20, maxSize - baseSize);
                      const size = baseSize + sizeIncrement;

                      return (
                        <div
                          key={keyword.id}
                          className={`relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                            userVote?.value === 1 ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-100 to-blue-200' : ''
                          } ${isVoting ? 'opacity-50 cursor-wait' : ''}`}
                          style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            minWidth: '120px',
                            minHeight: '120px'
                          }}
                          onClick={() => !isVoting && handleVote(keyword.id, userVote?.value === 1 ? -1 : 1)}
                        >
                          <div className="flex flex-col h-full justify-between">
                            <div className="flex-1 flex items-center justify-center text-center">
                              <p className="text-sm font-medium text-gray-900 leading-tight">
                                {keyword.text}
                              </p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{voteCount}</div>
                              <div className="text-xs text-gray-500">
                                {voteCount === 1 ? 'vote' : 'votes'}
                              </div>
                            </div>
                          </div>
                          {userVote?.value === 1 && (
                            <div className="absolute top-2 right-2 text-blue-600">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>
          </div>

          {/* Right: Participants & Stats */}
          <div className="lg:col-span-1 space-y-4">

            {/* Participants */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Participants ({session.participants.length})</h3>
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {session.participants.map(participant => (
                  <div key={participant.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{participant.name}</div>
                      {participant.isCreator && (
                        <div className="text-xs text-gray-500">Creator</div>
                      )}
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Stats */}
            {stats && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Session Stats</h3>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ideas:</span>
                    <span className="font-medium">{stats.keywordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total votes:</span>
                    <span className="font-medium">{stats.totalVotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consensus reached:</span>
                    <span className="font-medium">{stats.consensusCount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Invite Friends</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Share this link with friends to let them join the planning:
                </p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md bg-gray-50"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Session
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this session? This action cannot be undone and will remove all keywords and votes.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-secondary"
                disabled={isDeletingSession}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSession}
                className="flex-1 btn-danger"
                disabled={isDeletingSession}
              >
                {isDeletingSession ? 'Deleting...' : 'Delete Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionPage;
