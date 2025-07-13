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
import { useCreateSession } from '../hooks/useSession';
import { getCategoryInfo, getAllCategories } from '../utils/categories';
import type { CategoryType } from '../types';

export function CreateSession() {
  const navigate = useNavigate();
  const { createSession, isLoading, error } = useCreateSession();
  
  const [formData, setFormData] = useState({
    description: '',
    creatorName: '',
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const exampleDescriptions = [
    "weekend brunch with college friends downtown",
    "team building activity for remote coworkers",
    "birthday celebration dinner in the city",
    "casual coffee meetup for book club",
    "outdoor hiking adventure with nature lovers",
    "game night at someone's place",
  ];

  const handleExampleClick = (example: string) => {
    setFormData(prev => ({ ...prev, description: example }));
  };

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
              Collaborative meetup planning
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Meetup
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Describe your meetup idea and let your friends collaborate on the details
          </p>
          
          {/* Category Preview */}
          <div className="flex justify-center space-x-4 mb-8">
            {getAllCategories().map(category => {
              const info = getCategoryInfo(category);
              return (
                <div key={category} className={`px-3 py-2 rounded-lg ${info.bgColor} ${info.color} text-sm font-medium`}>
                  <span className="mr-1">{info.icon}</span>
                  {info.name}
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Session Form */}
        <div className="card">
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
                className="input-field h-24 resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific! Mention when, where, what kind of activity, or food preferences.
              </p>
            </div>

            {/* Example Descriptions */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Need inspiration? Try these:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {exampleDescriptions.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="text-left p-3 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    "{example}"
                  </button>
                ))}
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
                className="input-field"
                required
              />
            </div>

            {/* Advanced Options Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {showAdvanced ? '▼' : '▶'} Advanced options
              </button>
              
              {showAdvanced && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">🤖 <strong>AI-Powered Features:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Automatic keyword categorization using local LLM</li>
                      <li>Smart suggestions based on your description</li>
                      <li>Context-aware category recommendations</li>
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
              className="btn-primary w-full text-lg py-3"
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

        {/* How It Works */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📝</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">1. Describe</h4>
              <p className="text-sm text-gray-600">Share your meetup idea and get a shareable link</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">👥</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">2. Invite</h4>
              <p className="text-sm text-gray-600">Friends join and add their preferences in real-time</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🎯</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">3. Decide</h4>
              <p className="text-sm text-gray-600">Vote together and reach consensus on the perfect plan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateSession;
