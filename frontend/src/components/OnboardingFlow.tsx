/**
 * letscatchup.ai - Onboarding Flow Component
 * 
 * Personalized question flow for friends joining meetup planning sessions
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import React, { useState } from 'react';
import { getCategoryInfo, getAllCategories } from '../utils/categories';
import type { CategoryType, SessionData } from '../types';

interface OnboardingFlowProps {
  sessionData: SessionData;
  onComplete: (responses: OnboardingResponses) => void;
  onSkip: () => void;
}

export interface OnboardingResponses {
  preferences: {
    categories: CategoryType[];
    timeFlexibility: 'flexible' | 'specific' | 'no-preference';
    locationPreference: 'close' | 'anywhere' | 'specific';
    budgetRange: 'low' | 'medium' | 'high' | 'no-preference';
  };
  initialSuggestions: {
    text: string;
    category: CategoryType;
  }[];
  personalNote?: string;
}

export function OnboardingFlow({ sessionData, onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<OnboardingResponses>({
    preferences: {
      categories: [],
      timeFlexibility: 'no-preference',
      locationPreference: 'anywhere',
      budgetRange: 'no-preference',
    },
    initialSuggestions: [],
    personalNote: '',
  });

  const steps = [
    'interests',
    'preferences',
    'suggestions',
    'personal-note'
  ];

  const handleCategoryToggle = (category: CategoryType) => {
    setResponses(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        categories: prev.preferences.categories.includes(category)
          ? prev.preferences.categories.filter(c => c !== category)
          : [...prev.preferences.categories, category]
      }
    }));
  };

  const handlePreferenceChange = (key: keyof OnboardingResponses['preferences'], value: any) => {
    setResponses(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleAddSuggestion = (text: string, category: CategoryType) => {
    if (!text.trim()) return;
    
    setResponses(prev => ({
      ...prev,
      initialSuggestions: [
        ...prev.initialSuggestions,
        { text: text.trim(), category }
      ]
    }));
  };

  const handleRemoveSuggestion = (index: number) => {
    setResponses(prev => ({
      ...prev,
      initialSuggestions: prev.initialSuggestions.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(responses);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (steps[currentStep]) {
      case 'interests':
        return responses.preferences.categories.length > 0;
      case 'preferences':
        return true; // All preferences are optional
      case 'suggestions':
        return true; // Suggestions are optional
      case 'personal-note':
        return true; // Personal note is optional
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (steps[currentStep]) {
      case 'interests':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                What interests you most?
              </h3>
              <p className="text-gray-600">
                Select the aspects you'd like to help plan for "{sessionData.description}"
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {getAllCategories().map(category => {
                const info = getCategoryInfo(category);
                const isSelected = responses.preferences.categories.includes(category);
                
                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `${info.bgColor} ${info.color} border-current`
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{info.icon}</div>
                    <div className="font-medium">{info.name}</div>
                    <div className="text-sm opacity-75">{info.description}</div>
                  </button>
                );
              })}
            </div>
            
            <p className="text-sm text-gray-500 text-center">
              Select at least one area you'd like to contribute to
            </p>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tell us your preferences
              </h3>
              <p className="text-gray-600">
                This helps us suggest better options for the group
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How flexible are you with timing?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'flexible', label: 'Very flexible - any time works' },
                    { value: 'specific', label: 'I have specific time preferences' },
                    { value: 'no-preference', label: 'No strong preference' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="timeFlexibility"
                        value={option.value}
                        checked={responses.preferences.timeFlexibility === option.value}
                        onChange={(e) => handlePreferenceChange('timeFlexibility', e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location preference?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'close', label: 'Prefer somewhere close to me' },
                    { value: 'anywhere', label: 'Anywhere is fine' },
                    { value: 'specific', label: 'I have specific location ideas' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="locationPreference"
                        value={option.value}
                        checked={responses.preferences.locationPreference === option.value}
                        onChange={(e) => handlePreferenceChange('locationPreference', e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget consideration?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: 'Budget-friendly options preferred' },
                    { value: 'medium', label: 'Moderate spending is okay' },
                    { value: 'high', label: 'Premium options are fine' },
                    { value: 'no-preference', label: 'No strong preference' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="budgetRange"
                        value={option.value}
                        checked={responses.preferences.budgetRange === option.value}
                        onChange={(e) => handlePreferenceChange('budgetRange', e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'suggestions':
        return (
          <SuggestionsStep
            responses={responses}
            onAddSuggestion={handleAddSuggestion}
            onRemoveSuggestion={handleRemoveSuggestion}
          />
        );

      case 'personal-note':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Anything else to share?
              </h3>
              <p className="text-gray-600">
                Any special considerations, dietary restrictions, or other notes for the group?
              </p>
            </div>

            <textarea
              value={responses.personalNote || ''}
              onChange={(e) => setResponses(prev => ({ ...prev, personalNote: e.target.value }))}
              placeholder="e.g., I'm vegetarian, I can't stay out too late, I have a car and can drive..."
              className="input-field h-24 resize-none"
            />

            <p className="text-sm text-gray-500 text-center">
              This is optional but helps the group plan better
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <button onClick={onSkip} className="text-primary-600 hover:text-primary-700">
            Skip onboarding
          </button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="card mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}

// Separate component for suggestions step to keep main component under 300 lines
function SuggestionsStep({ 
  responses, 
  onAddSuggestion, 
  onRemoveSuggestion 
}: {
  responses: OnboardingResponses;
  onAddSuggestion: (text: string, category: CategoryType) => void;
  onRemoveSuggestion: (index: number) => void;
}) {
  const [newSuggestion, setNewSuggestion] = useState({ text: '', category: 'activity' as CategoryType });

  const handleAdd = () => {
    if (newSuggestion.text.trim()) {
      onAddSuggestion(newSuggestion.text, newSuggestion.category);
      setNewSuggestion({ text: '', category: 'activity' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Share your initial ideas
        </h3>
        <p className="text-gray-600">
          Add some suggestions to get the conversation started
        </p>
      </div>

      {/* Add Suggestion Form */}
      <div className="space-y-3">
        <input
          type="text"
          value={newSuggestion.text}
          onChange={(e) => setNewSuggestion(prev => ({ ...prev, text: e.target.value }))}
          placeholder="e.g., Saturday 2PM, Central Park, Italian food..."
          className="input-field"
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        
        <div className="flex space-x-2">
          {getAllCategories().map(category => {
            const info = getCategoryInfo(category);
            const isSelected = newSuggestion.category === category;
            
            return (
              <button
                key={category}
                onClick={() => setNewSuggestion(prev => ({ ...prev, category }))}
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
        
        <button
          onClick={handleAdd}
          disabled={!newSuggestion.text.trim()}
          className="btn-primary w-full disabled:opacity-50"
        >
          Add Suggestion
        </button>
      </div>

      {/* Current Suggestions */}
      {responses.initialSuggestions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Your suggestions:</h4>
          <div className="space-y-2">
            {responses.initialSuggestions.map((suggestion, index) => {
              const info = getCategoryInfo(suggestion.category);
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{info.icon}</span>
                    <span className="font-medium">{suggestion.text}</span>
                    <span className={`px-2 py-1 rounded text-xs ${info.bgColor} ${info.color}`}>
                      {info.name}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveSuggestion(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 text-center">
        These suggestions are optional but help get the planning started
      </p>
    </div>
  );
}

export default OnboardingFlow;
