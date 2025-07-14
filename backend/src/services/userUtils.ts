/**
 * letscatchup.ai - User Utilities
 * 
 * Utility functions for user management, code generation, and validation
 * 
 * @author Siddesh Shinde
 * @license MIT
 */

import { PlanningSession, Participant } from '../models/types';

/**
 * Generate a unique 3-digit user code (100-999)
 * @param existingCodes - Array of existing codes to avoid duplicates
 * @returns 3-digit string code
 */
export function generateUserCode(existingCodes: string[] = []): string {
  const maxAttempts = 10; // Prevent infinite loops
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    // Generate random 3-digit code (100-999)
    const code = Math.floor(100 + Math.random() * 900).toString();
    
    // Check if code is unique
    if (!existingCodes.includes(code)) {
      return code;
    }
    
    attempts++;
  }
  
  // Fallback: find first available code (should rarely happen)
  for (let i = 100; i <= 999; i++) {
    const code = i.toString();
    if (!existingCodes.includes(code)) {
      return code;
    }
  }
  
  // Ultimate fallback (should never happen with 900 possible codes)
  throw new Error('Unable to generate unique user code - session is full');
}

/**
 * Check if a name is already taken in the session (case-insensitive)
 * @param session - The planning session
 * @param name - The name to check
 * @param excludeUserId - Optional user ID to exclude from check (for name updates)
 * @returns true if name is taken, false if available
 */
export function isNameTakenInSession(
  session: PlanningSession, 
  name: string, 
  excludeUserId?: string
): boolean {
  const normalizedName = name.trim().toLowerCase();
  
  for (const [userId, participant] of session.participants) {
    // Skip the excluded user (useful for name updates)
    if (excludeUserId && userId === excludeUserId) {
      continue;
    }
    
    if (participant.name.trim().toLowerCase() === normalizedName) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get all existing user codes in a session
 * @param session - The planning session
 * @returns Array of user codes
 */
export function getExistingUserCodes(session: PlanningSession): string[] {
  const codes: string[] = [];
  
  for (const participant of session.participants.values()) {
    codes.push(participant.userCode);
  }
  
  return codes;
}

/**
 * Validate user name format
 * @param name - The name to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateUserName(name: string): { isValid: boolean; error?: string } {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: 'Name cannot be empty' };
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters long' };
  }
  
  // Check for invalid characters (allow letters, numbers, spaces, basic punctuation)
  const validNameRegex = /^[a-zA-Z0-9\s\-_'.]+$/;
  if (!validNameRegex.test(trimmedName)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }
  
  return { isValid: true };
}

/**
 * Check if user is admin of the session
 * @param session - The planning session
 * @param userId - The user ID to check
 * @returns true if user is admin, false otherwise
 */
export function isUserAdmin(session: PlanningSession, userId: string): boolean {
  return session.adminUserId === userId;
}

/**
 * Get participant by user ID
 * @param session - The planning session
 * @param userId - The user ID to find
 * @returns Participant object or null if not found
 */
export function getParticipantById(session: PlanningSession, userId: string): Participant | null {
  return session.participants.get(userId) || null;
}

/**
 * Find participant by user code
 * @param session - The planning session
 * @param userCode - The user code to find
 * @returns Participant object or null if not found
 */
export function getParticipantByCode(session: PlanningSession, userCode: string): Participant | null {
  for (const participant of session.participants.values()) {
    if (participant.userCode === userCode) {
      return participant;
    }
  }
  return null;
}
