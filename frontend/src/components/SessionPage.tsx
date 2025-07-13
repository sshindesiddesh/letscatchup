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
import { useAddKeyword, useVote } from '../hooks/useSession';
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

  const [newKeyword, setNewKeyword] = useState({
    text: '',
    category: 'activity' as CategoryType,
  });

  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Fetch session data if not in store
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!session && sessionId && user) {
        console.log('🔄 Fetching session data for:', sessionId);
        setIsLoadingSession(true);
        try {
          const sessionData = await apiService.getSession(sessionId);
          console.log('✅ Session data fetched:', sessionData);
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

  // Redirect if no session or user
  useEffect(() => {
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
      setShowAddKeyword(false);
    } catch (error) {
      console.error('Failed to add keyword:', error);
    }
  };

  const handleVote = async (keywordId: string, value: 1 | -1) => {
    try {
      await vote(keywordId, value);
    } catch (error) {
      console.error('Failed to vote:', error);
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
              <ConnectionStatus />
              <button
                onClick={copyShareLink}
                className="btn-secondary text-sm"
              >
                📋 Copy invite link
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Keyword Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Add Your Ideas</h2>
                <button
                  onClick={() => setShowAddKeyword(!showAddKeyword)}
                  className="btn-primary text-sm"
                >
                  {showAddKeyword ? 'Cancel' : '+ Add Idea'}
                </button>
              </div>

              {showAddKeyword && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <input
                      type="text"
                      value={newKeyword.text}
                      onChange={(e) => handleKeywordTextChange(e.target.value)}
                      placeholder="e.g., Saturday 11AM, Central Park, pizza..."
                      className="input-field"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category (auto-suggested)
                    </label>
                    <div className="flex space-x-2">
                      {getAllCategories().map(category => {
                        const info = getCategoryInfo(category);
                        const isSelected = newKeyword.category === category;
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setNewKeyword(prev => ({ ...prev, category }))}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isSelected
                                ? `${info.bgColor} ${info.color} border-2 border-current`
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <span className="mr-1">{info.icon}</span>
                            {info.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={handleAddKeyword}
                    disabled={isAddingKeyword || !newKeyword.text.trim()}
                    className="btn-primary w-full"
                  >
                    {isAddingKeyword ? 'Adding...' : 'Add Idea'}
                  </button>
                </div>
              )}
            </div>

            {/* Keywords by Category */}
            {getAllCategories().map(category => {
              const categoryKeywords = session.keywords.filter(k => k.category === category);
              if (categoryKeywords.length === 0) return null;

              const info = getCategoryInfo(category);
              
              return (
                <div key={category} className="card">
                  <div className="flex items-center mb-4">
                    <div className={`px-3 py-1 rounded-lg ${info.bgColor} ${info.color} text-sm font-medium mr-3`}>
                      <span className="mr-1">{info.icon}</span>
                      {info.name}
                    </div>
                    <span className="text-sm text-gray-500">
                      {categoryKeywords.length} idea{categoryKeywords.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {categoryKeywords
                      .sort((a, b) => b.totalScore - a.totalScore)
                      .map(keyword => {
                        const userVote = keyword.votes.find(vote => vote.userId === user.id);
                        const positiveVotes = keyword.votes.filter(v => v.value === 1).length;
                        const negativeVotes = keyword.votes.filter(v => v.value === -1).length;
                        
                        return (
                          <div key={keyword.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <span className="font-medium">{keyword.text}</span>
                              <div className="text-xs text-gray-500 mt-1">
                                Added by {session.participants.find(p => p.id === keyword.addedBy)?.name || 'Unknown'}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="text-sm text-gray-600">
                                Score: <span className="font-medium">{keyword.totalScore}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleVote(keyword.id, 1)}
                                  disabled={isVoting}
                                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                                    userVote?.value === 1
                                      ? 'bg-green-100 text-green-700 border border-green-300'
                                      : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                                  }`}
                                >
                                  👍 {positiveVotes}
                                </button>
                                <button
                                  onClick={() => handleVote(keyword.id, -1)}
                                  disabled={isVoting}
                                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                                    userVote?.value === -1
                                      ? 'bg-red-100 text-red-700 border border-red-300'
                                      : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                                  }`}
                                >
                                  👎 {negativeVotes}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}

            {session.keywords.length === 0 && (
              <div className="card text-center py-12">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas yet</h3>
                <p className="text-gray-600 mb-4">Be the first to add an idea for your meetup!</p>
                <button
                  onClick={() => setShowAddKeyword(true)}
                  className="btn-primary"
                >
                  Add First Idea
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="card">
              <h3 className="font-semibold mb-4">Participants ({session.participants.length})</h3>
              <div className="space-y-2">
                {session.participants.map(participant => (
                  <div key={participant.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{participant.name}</div>
                      {participant.isCreator && (
                        <div className="text-xs text-gray-500">Creator</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Stats */}
            {stats && (
              <div className="card">
                <h3 className="font-semibold mb-4">Session Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ideas:</span>
                    <span className="font-medium">{stats.keywordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total votes:</span>
                    <span className="font-medium">{stats.totalVotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consensus reached:</span>
                    <span className="font-medium">{stats.consensusCount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="card">
              <h3 className="font-semibold mb-4">Invite Friends</h3>
              <p className="text-sm text-gray-600 mb-3">
                Share this link with friends to let them join the planning:
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="input-field text-xs flex-1"
                />
                <button
                  onClick={copyShareLink}
                  className="btn-secondary text-xs px-3"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionPage;
