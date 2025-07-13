# Data Structures & Type System

> Complete TypeScript interfaces and data models for letscatchup.ai

## 📋 Core Data Models

### 🎯 Planning Session
```typescript
interface PlanningSession {
  id: string;                    // Session identifier (MVP: 'current')
  description: string;           // Natural language meetup description
  participants: Map<string, Participant>;  // User ID -> Participant mapping
  keywords: Map<string, Keyword>;          // Keyword ID -> Keyword mapping
  consensus: {
    finalized: string[];         // Keyword IDs with consensus
    pending: string[];           // Keyword IDs under consideration
  };
  status: 'active' | 'completed' | 'expired';
  createdAt: Date;
  expiresAt: Date;              // 24-hour automatic expiration
}
```

### 👤 Participant
```typescript
interface Participant {
  id: string;                   // Unique user identifier
  name: string;                 // Display name
  joinedAt: Date;              // When they joined the session
  isCreator: boolean;          // Session creator flag
  socketId?: string;           // Socket.io connection ID (optional)
}
```

### 💡 Keyword
```typescript
interface Keyword {
  id: string;                  // Unique keyword identifier
  text: string;                // The actual keyword/suggestion
  category: CategoryType;      // time | location | food | activity
  votes: Map<string, Vote>;    // User ID -> Vote mapping
  totalScore: number;          // Sum of all vote values
  addedBy: string;            // User ID who added this keyword
  createdAt: Date;
}
```

### 🗳️ Vote
```typescript
interface Vote {
  userId: string;              // Who voted
  value: VoteValue;           // 1 (upvote) or -1 (downvote)
  timestamp: Date;            // When the vote was cast
}
```

## 🏷️ Type Definitions

### Category Types
```typescript
type CategoryType = 'time' | 'location' | 'food' | 'activity';
type VoteValue = 1 | -1;
type SessionStatus = 'active' | 'completed' | 'expired';
```

## 📡 API Data Transfer Objects

### Request Types
```typescript
interface CreateSessionRequest {
  description: string;         // Natural language meetup description
  creatorName: string;        // Creator's display name
}

interface JoinSessionRequest {
  name: string;               // Participant's display name
}

interface AddKeywordRequest {
  userId: string;             // Who is adding the keyword
  text: string;              // The keyword text
  category: CategoryType;    // Keyword category
}

interface VoteRequest {
  userId: string;            // Who is voting
  keywordId: string;        // Which keyword to vote on
  value: VoteValue;         // Vote value (1 or -1)
}
```

### Response Types
```typescript
interface CreateSessionResponse {
  sessionId: string;         // Created session ID
  shareLink: string;        // Shareable join link
  userId: string;           // Creator's user ID
}

interface JoinSessionResponse {
  userId: string;           // Assigned user ID
  sessionData: SessionData; // Complete session state
}
```

## 📊 Serialized Data Formats

### Session Data (API Response)
```typescript
interface SessionData {
  id: string;
  description: string;
  participants: ParticipantData[];
  keywords: KeywordData[];
  consensus: {
    finalized: string[];
    pending: string[];
  };
  status: SessionStatus;
  createdAt: string;        // ISO string
  expiresAt: string;        // ISO string
}
```

### Participant Data
```typescript
interface ParticipantData {
  id: string;
  name: string;
  joinedAt: string;         // ISO string
  isCreator: boolean;
}
```

### Keyword Data
```typescript
interface KeywordData {
  id: string;
  text: string;
  category: CategoryType;
  votes: VoteData[];
  totalScore: number;
  addedBy: string;
  createdAt: string;        // ISO string
}
```

### Vote Data
```typescript
interface VoteData {
  userId: string;
  value: VoteValue;
  timestamp: string;        // ISO string
}
```

## 🔌 Socket.io Event Types

### Client to Server Events
```typescript
interface ClientToServerEvents {
  'join-session': (data: { sessionId: string; userId: string }) => void;
  'add-keyword': (data: { sessionId: string; userId: string; text: string; category: string }) => void;
  'vote': (data: { sessionId: string; userId: string; keywordId: string; value: number }) => void;
  'typing': (data: { sessionId: string; userId: string; isTyping: boolean }) => void;
}
```

### Server to Client Events
```typescript
interface ServerToClientEvents {
  'session-updated': (sessionData: SessionData) => void;
  'participant-joined': (participant: ParticipantData) => void;
  'participant-offline': (data: { userId: string; name: string }) => void;
  'participant-count-updated': (data: { total: number; online: number; timestamp: string }) => void;
  'keyword-added': (data: { keywordId: string; keyword: KeywordData; timestamp: string }) => void;
  'vote-updated': (data: { keywordId: string; totalScore: number; voteCount: number; timestamp: string }) => void;
  'consensus-reached': (data: { keywordIds: string[]; keywords: any[]; timestamp: string }) => void;
  'session-stats-updated': (data: { stats: any; timestamp: string }) => void;
  'user-typing': (data: { userId: string; isTyping: boolean; timestamp: string }) => void;
  'error': (error: { message: string }) => void;
  'system-message': (data: { message: string; timestamp: string }) => void;
}
```

## 🎯 Consensus Algorithm

### Consensus Detection Logic
```typescript
// A keyword reaches consensus when:
// 1. At least 60% of participants vote positively (+1)
// 2. Less than 25% of participants vote negatively (-1)
// 3. At least 2 participants have voted (minimum threshold)

function hasConsensus(keyword: Keyword, totalParticipants: number): boolean {
  const voteCount = keyword.votes.size;
  const positiveVotes = Array.from(keyword.votes.values())
    .filter(vote => vote.value === 1).length;
  const negativeVotes = Array.from(keyword.votes.values())
    .filter(vote => vote.value === -1).length;
  
  if (voteCount < 2) return false; // Minimum threshold
  
  const positiveRatio = positiveVotes / totalParticipants;
  const negativeRatio = negativeVotes / totalParticipants;
  
  return positiveRatio >= 0.6 && negativeRatio < 0.25;
}
```

## 🔄 Data Flow Patterns

### Session Creation Flow
1. `CreateSessionRequest` → SessionManager
2. Generate unique IDs (session, user)
3. Create `PlanningSession` object
4. Schedule automatic cleanup (24h)
5. Return `CreateSessionResponse`

### Real-time Update Flow
1. API endpoint receives request
2. SessionManager processes change
3. Socket.io broadcasts to session room
4. All connected clients receive update
5. Frontend updates UI reactively

---

**File Location**: `backend/src/models/types.ts`  
**Last Updated**: 2025-07-13
