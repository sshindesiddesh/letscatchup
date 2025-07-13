/**
 * letscatchup.ai - Onboarding Insights Component
 * 
 * Display aggregated insights from friend onboarding responses
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import React from 'react';
import { getCategoryInfo } from '../utils/categories';
import type { OnboardingResponses } from './OnboardingFlow';
import type { CategoryType } from '../types';

interface OnboardingInsightsProps {
  responses: OnboardingResponses[];
  participantCount: number;
}

export function OnboardingInsights({ responses, participantCount }: OnboardingInsightsProps) {
  if (responses.length === 0) {
    return null;
  }

  // Aggregate insights
  const insights = {
    categoryInterests: {} as Record<CategoryType, number>,
    timeFlexibility: {
      flexible: 0,
      specific: 0,
      'no-preference': 0
    },
    locationPreference: {
      close: 0,
      anywhere: 0,
      specific: 0
    },
    budgetRange: {
      low: 0,
      medium: 0,
      high: 0,
      'no-preference': 0
    },
    personalNotes: responses.filter(r => r.personalNote?.trim()).map(r => r.personalNote!.trim())
  };

  // Count category interests
  responses.forEach(response => {
    response.preferences.categories.forEach(category => {
      insights.categoryInterests[category] = (insights.categoryInterests[category] || 0) + 1;
    });
    
    insights.timeFlexibility[response.preferences.timeFlexibility]++;
    insights.locationPreference[response.preferences.locationPreference]++;
    insights.budgetRange[response.preferences.budgetRange]++;
  });

  const getPercentage = (count: number) => Math.round((count / responses.length) * 100);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Group Insights</h3>
        <span className="text-sm text-gray-500">
          {responses.length} of {participantCount} shared preferences
        </span>
      </div>

      <div className="space-y-4">
        {/* Category Interests */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Most interested in:</h4>
          <div className="space-y-1">
            {Object.entries(insights.categoryInterests)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([category, count]) => {
                const info = getCategoryInfo(category as CategoryType);
                const percentage = getPercentage(count);
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{info.icon}</span>
                      <span className="text-sm">{info.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${info.bgColor.replace('50', '400')}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Time Flexibility */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Time flexibility:</h4>
          <div className="text-sm text-gray-600">
            {insights.timeFlexibility.flexible > 0 && (
              <span className="mr-4">
                🕐 {getPercentage(insights.timeFlexibility.flexible)}% flexible
              </span>
            )}
            {insights.timeFlexibility.specific > 0 && (
              <span className="mr-4">
                ⏰ {getPercentage(insights.timeFlexibility.specific)}% have specific preferences
              </span>
            )}
          </div>
        </div>

        {/* Location Preference */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Location preference:</h4>
          <div className="text-sm text-gray-600">
            {insights.locationPreference.close > 0 && (
              <span className="mr-4">
                📍 {getPercentage(insights.locationPreference.close)}% prefer close locations
              </span>
            )}
            {insights.locationPreference.specific > 0 && (
              <span className="mr-4">
                🎯 {getPercentage(insights.locationPreference.specific)}% have specific ideas
              </span>
            )}
            {insights.locationPreference.anywhere > 0 && (
              <span className="mr-4">
                🌍 {getPercentage(insights.locationPreference.anywhere)}% are flexible
              </span>
            )}
          </div>
        </div>

        {/* Budget Considerations */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Budget considerations:</h4>
          <div className="text-sm text-gray-600">
            {insights.budgetRange.low > 0 && (
              <span className="mr-4">
                💰 {getPercentage(insights.budgetRange.low)}% prefer budget-friendly
              </span>
            )}
            {insights.budgetRange.high > 0 && (
              <span className="mr-4">
                💎 {getPercentage(insights.budgetRange.high)}% okay with premium
              </span>
            )}
          </div>
        </div>

        {/* Personal Notes */}
        {insights.personalNotes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Special considerations:</h4>
            <div className="space-y-1">
              {insights.personalNotes.slice(0, 3).map((note, index) => (
                <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  "{note}"
                </div>
              ))}
              {insights.personalNotes.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{insights.personalNotes.length - 3} more notes
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="pt-3 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Recommendations:</h4>
          <div className="space-y-1 text-xs text-gray-600">
            {insights.timeFlexibility.flexible > insights.timeFlexibility.specific && (
              <div>• Most people are flexible with timing - consider multiple time options</div>
            )}
            {insights.locationPreference.close > insights.locationPreference.anywhere && (
              <div>• Many prefer close locations - focus on nearby venues</div>
            )}
            {insights.budgetRange.low > insights.budgetRange.high && (
              <div>• Budget-conscious group - emphasize affordable options</div>
            )}
            {Object.values(insights.categoryInterests).some(count => count > responses.length * 0.6) && (
              <div>• Strong consensus on preferences - focus on popular categories</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingInsights;
