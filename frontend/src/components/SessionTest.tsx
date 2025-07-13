/**
 * letscatchup.ai - Session Test Component
 * 
 * Test component for demonstrating real-time features
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import React, { useState } from 'react';
import { useCreateSession, useJoinSession, useAddKeyword, useVote } from '../hooks/useSession';
import { useSession, useUser, useSessionStats } from '../store/sessionStore';
import { ConnectionStatus } from './ConnectionStatus';
import { getCategoryInfo, getAllCategories } from '../utils/categories';
import type { CategoryType } from '../types';

export function SessionTest() {
  const session = useSession();
  const user = useUser();
  const stats = useSessionStats();
  
  const { createSession, isLoading: isCreating } = useCreateSession();
  const { joinSession, isLoading: isJoining } = useJoinSession();
  const { addKeyword, isLoading: isAddingKeyword } = useAddKeyword();
  const { vote, isLoading: isVoting } = useVote();

  const [sessionForm, setSessionForm] = useState({
    description: 'weekend brunch with college friends downtown',
    creatorName: 'Sarah'
  });

  const [joinForm, setJoinForm] = useState({
    name: 'Mike'
  });

  const [keywordForm, setKeywordForm] = useState({
    text: 'Saturday 11AM',
    category: 'time' as CategoryType
  });

  const handleCreateSession = async () => {
    try {
      await createSession(sessionForm);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleJoinSession = async () => {
    try {
      await joinSession('current', joinForm);
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };

  const handleAddKeyword = async () => {
    try {
      await addKeyword(keywordForm.text, keywordForm.category);
      setKeywordForm({ text: '', category: 'time' });
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">🧪 Real-time Features Test</h1>
          <ConnectionStatus />
        </div>
        <p className="text-gray-600">
          Test the Socket.io real-time communication and state management
        </p>
      </div>

      {/* Session Creation */}
      {!session && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Create Session</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={sessionForm.description}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                className="input-field"
                placeholder="Describe your meetup..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={sessionForm.creatorName}
                onChange={(e) => setSessionForm({ ...sessionForm, creatorName: e.target.value })}
                className="input-field"
                placeholder="Your name"
              />
            </div>
            <button
              onClick={handleCreateSession}
              disabled={isCreating}
              className="btn-primary w-full"
            >
              {isCreating ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </div>
      )}

      {/* Session Joining */}
      {!session && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Join Session</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={joinForm.name}
                onChange={(e) => setJoinForm({ name: e.target.value })}
                className="input-field"
                placeholder="Your name"
              />
            </div>
            <button
              onClick={handleJoinSession}
              disabled={isJoining}
              className="btn-secondary w-full"
            >
              {isJoining ? 'Joining...' : 'Join Current Session'}
            </button>
          </div>
        </div>
      )}

      {/* Session Info */}
      {session && user && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Session Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900">Description</h3>
              <p className="text-gray-600">{session.description}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Your Role</h3>
              <p className="text-gray-600">
                {user.name} {user.isCreator ? '(Creator)' : '(Participant)'}
              </p>
            </div>
            {stats && (
              <div className="md:col-span-2">
                <h3 className="font-medium text-gray-900 mb-2">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Participants:</span>
                    <span className="ml-1 font-medium">{stats.participantCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Keywords:</span>
                    <span className="ml-1 font-medium">{stats.keywordCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Votes:</span>
                    <span className="ml-1 font-medium">{stats.totalVotes}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Consensus:</span>
                    <span className="ml-1 font-medium">{stats.consensusCount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Keyword */}
      {session && user && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Add Keyword</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keyword
              </label>
              <input
                type="text"
                value={keywordForm.text}
                onChange={(e) => setKeywordForm({ ...keywordForm, text: e.target.value })}
                className="input-field"
                placeholder="Enter a suggestion..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={keywordForm.category}
                onChange={(e) => setKeywordForm({ ...keywordForm, category: e.target.value as CategoryType })}
                className="input-field"
              >
                {getAllCategories().map(category => {
                  const info = getCategoryInfo(category);
                  return (
                    <option key={category} value={category}>
                      {info.icon} {info.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <button
              onClick={handleAddKeyword}
              disabled={isAddingKeyword || !keywordForm.text.trim()}
              className="btn-primary w-full"
            >
              {isAddingKeyword ? 'Adding...' : 'Add Keyword'}
            </button>
          </div>
        </div>
      )}

      {/* Keywords List */}
      {session && session.keywords.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Keywords & Voting</h2>
          <div className="space-y-3">
            {session.keywords.map(keyword => {
              const categoryInfo = getCategoryInfo(keyword.category);
              const userVote = keyword.votes.find(vote => vote.userId === user?.id);
              
              return (
                <div key={keyword.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{categoryInfo.icon}</span>
                      <div>
                        <span className="font-medium">{keyword.text}</span>
                        <div className="text-sm text-gray-500">
                          {categoryInfo.name} • Score: {keyword.totalScore} • Votes: {keyword.votes.length}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVote(keyword.id, 1)}
                        disabled={isVoting}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          userVote?.value === 1
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                        }`}
                      >
                        👍 {keyword.votes.filter(v => v.value === 1).length}
                      </button>
                      <button
                        onClick={() => handleVote(keyword.id, -1)}
                        disabled={isVoting}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          userVote?.value === -1
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                        }`}
                      >
                        👎 {keyword.votes.filter(v => v.value === -1).length}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Participants */}
      {session && session.participants.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Participants</h2>
          <div className="space-y-2">
            {session.participants.map(participant => (
              <div key={participant.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{participant.name}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {participant.isCreator ? 'Creator' : 'Participant'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionTest;
