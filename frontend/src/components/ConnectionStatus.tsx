/**
 * letscatchup.ai - Connection Status Component
 * 
 * Real-time connection status indicator
 * 
 * Copyright (c) 2025 Siddesh Shinde
 * Licensed under the MIT License
 */

import React from 'react';
import { useUIState } from '../store/sessionStore';

export function ConnectionStatus() {
  const { isConnected, error } = useUIState();

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-sm font-medium">Connection Error</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-2 text-yellow-600">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-sm font-medium">Connected</span>
    </div>
  );
}

export default ConnectionStatus;
