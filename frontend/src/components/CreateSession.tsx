/**
 * letscatchup.ai - Create Session Component
 * 
 * Landing page for creating new meetup planning sessions
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateSession, useRejoinSession } from '../hooks/useSession';
import { getCategoryInfo, getAllCategories } from '../utils/categories';
import type { CategoryType } from '../types';

export function CreateSession() {
  const navigate = useNavigate();
  const { createSession, isLoading, error } = useCreateSession();
  const { rejoinSession, isLoading: isRejoining, error: rejoinError } = useRejoinSession();

  const [formData, setFormData] = useState({
    description: '',
    creatorName: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [step, setStep] = useState<'choice' | 'create' | 'rejoin'>('choice');
  const [userCode, setUserCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.creatorName.trim()) {
      return;
    }

    try {
      const result = await createSession({
        description: formData.description.trim(),
        creatorName: formData.creatorName.trim(),
      });
      
      // Navigate to the session page
      navigate(`/session/${result.sessionId}`);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRejoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userCode.trim() || userCode.trim().length !== 3) {
      return;
    }

    try {
      await rejoinSession(userCode.trim());

      // Navigate to the session page
      navigate('/session/current');
    } catch (err) {
      console.error('Failed to rejoin session:', err);
    }
  };

  const exampleDescriptions = [
    "weekend brunch with college friends downtown",
    "casual coffee meetup for book club",
  ];

  const handleExampleClick = (example: string) => {
    setFormData(prev => ({ ...prev, description: example }));
  };

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
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl">

          {/* Step 1: How it works (always visible at top) */}
          {step === 'choice' && (
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">How it works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. Describe</h3>
                  <p className="text-sm text-gray-600">Share your meetup idea and get a shareable link</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. Invite</h3>
                  <p className="text-sm text-gray-600">Friends join and add their preferences in real-time</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Decide</h3>
                  <p className="text-sm text-gray-600">Vote together and reach consensus on the perfect plan</p>
                </div>
              </div>

              {/* Choice Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 text-center">What would you like to do?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setStep('create')}
                    className="p-4 sm:p-6 border-2 border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-all duration-200 group"
                  >
                    <div className="font-semibold text-gray-900 text-base sm:text-lg mb-2">🚀 Create New Catchup</div>
                    <div className="text-sm text-gray-600">Start a new meetup planning session</div>
                  </button>
                  <button
                    onClick={() => setStep('rejoin')}
                    className="p-4 sm:p-6 border-2 border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-all duration-200 group"
                  >
                    <div className="font-semibold text-gray-900 text-base sm:text-lg mb-2">🔄 Join Existing Catchup</div>
                    <div className="text-sm text-gray-600">I have a 3-digit code</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Session Form */}
          {step === 'create' && (
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Description Field */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your meetup idea
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="e.g., weekend brunch with college friends downtown"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific! Mention when, where, what kind of activity, or food preferences.
                  </p>
                </div>

                {/* Example Descriptions - Only 2 most appealing */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Need inspiration? Try these:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleExampleClick("weekend brunch with college friends downtown")}
                      className="text-left p-3 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      "weekend brunch with college friends downtown"
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExampleClick("casual coffee meetup for book club")}
                      className="text-left p-3 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      "casual coffee meetup for book club"
                    </button>
                  </div>
                </div>

                {/* Creator Name Field */}
                <div>
                  <label htmlFor="creatorName" className="block text-sm font-medium text-gray-700 mb-2">
                    Your name
                  </label>
                  <input
                    id="creatorName"
                    type="text"
                    value={formData.creatorName}
                    onChange={(e) => handleInputChange('creatorName', e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Advanced Options Toggle - Simplified */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showAdvanced ? '▼' : '▶'} Advanced options
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        <p className="mb-2"><strong>Enhanced Features:</strong></p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Automatic keyword categorization</li>
                          <li>Smart suggestions based on your description</li>
                          <li>Real-time collaboration tools</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !formData.description.trim() || !formData.creatorName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating session...
                    </span>
                  ) : (
                    'Create Meetup Session'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Rejoin Session Form */}
          {step === 'rejoin' && (
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
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
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                    maxLength={3}
                    pattern="[0-9]{3}"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    This is the 3-digit code you received when you first created or joined a session
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
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateSession;
