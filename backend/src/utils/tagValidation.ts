/**
 * Tag validation utilities for letscatchup.ai
 * 
 * Tags should be formatted as:
 * - Letters only (a-z, A-Z)
 * - Max 2 hyphens (creating 3 logical words)
 * - No spaces
 * - Examples: "coffee", "saturday-morning", "central-park-meetup"
 */

export interface TagValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

/**
 * Validate tag format
 */
export function validateTag(text: string): TagValidationResult {
  if (!text || text.trim().length === 0) {
    return {
      isValid: false,
      error: 'Tag cannot be empty'
    };
  }

  const trimmed = text.trim();

  // Check for spaces
  if (trimmed.includes(' ')) {
    return {
      isValid: false,
      error: 'Tags cannot contain spaces',
      suggestion: trimmed.replace(/\s+/g, '-').toLowerCase()
    };
  }

  // Check for more than 2 hyphens (max 3 words)
  const hyphenCount = (trimmed.match(/-/g) || []).length;
  if (hyphenCount > 2) {
    return {
      isValid: false,
      error: 'Tags can have maximum 2 hyphens (3 words)',
      suggestion: trimmed.split('-').slice(0, 3).join('-').toLowerCase()
    };
  }

  // Check for invalid characters (only letters and hyphens allowed)
  const validPattern = /^[a-zA-Z]+(-[a-zA-Z]+)*$/;
  if (!validPattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'Tags can only contain letters and hyphens',
      suggestion: trimmed.replace(/[^a-zA-Z-]/g, '').toLowerCase()
    };
  }

  // Check for consecutive hyphens
  if (trimmed.includes('--')) {
    return {
      isValid: false,
      error: 'Tags cannot have consecutive hyphens',
      suggestion: trimmed.replace(/-+/g, '-').toLowerCase()
    };
  }

  // Check for leading/trailing hyphens
  if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
    return {
      isValid: false,
      error: 'Tags cannot start or end with hyphens',
      suggestion: trimmed.replace(/^-+|-+$/g, '').toLowerCase()
    };
  }

  return {
    isValid: true
  };
}

/**
 * Normalize tag to proper format
 */
export function normalizeTag(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^a-zA-Z-]/g, '')     // Remove non-letter, non-hyphen characters
    .replace(/-+/g, '-')            // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '')        // Remove leading/trailing hyphens
    .split('-')                     // Split by hyphens
    .slice(0, 3)                    // Take only first 3 parts
    .join('-');                     // Rejoin with hyphens
}

/**
 * Get tag validation error message for UI
 */
export function getTagErrorMessage(result: TagValidationResult): string {
  if (result.isValid) return '';
  
  let message = result.error || 'Invalid tag format';
  if (result.suggestion) {
    message += `. Try: "${result.suggestion}"`;
  }
  
  return message;
}

/**
 * Examples of valid tags
 */
export const VALID_TAG_EXAMPLES = [
  'coffee',
  'saturday-morning',
  'central-park',
  'pizza-and-beer',
  'weekend-brunch'
];

/**
 * Examples of invalid tags with corrections
 */
export const INVALID_TAG_EXAMPLES = [
  { invalid: 'coffee shop', valid: 'coffee-shop' },
  { invalid: 'saturday morning coffee', valid: 'saturday-morning-coffee' },
  { invalid: 'central park in manhattan', valid: 'central-park-manhattan' },
  { invalid: 'pizza & beer', valid: 'pizza-beer' },
  { invalid: '--weekend--', valid: 'weekend' }
];
