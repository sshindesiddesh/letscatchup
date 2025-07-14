# API Documentation

## Overview

The letscatchup.ai API provides RESTful endpoints for session management and real-time Socket.io events for live collaboration.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: TBD

## Authentication

Currently, no authentication is required. Sessions are managed through session IDs and user IDs.

## REST API Endpoints

### Session Management

#### Create Session
```http
POST /api/session/create
```

**Request Body:**
```json
{
  "description": "Coffee meetup planning",
  "creatorName": "John Doe"
}
```

**Response:**
```json
{
  "sessionId": "current",
  "shareLink": "/join/current",
  "userId": "user_abc123",
  "userCode": "123"
}
```

#### Get Current Session
```http
GET /api/session/current
```

**Response:**
```json
{
  "id": "current",
  "description": "Coffee meetup planning",
  "createdAt": "2025-07-13T22:00:00.000Z",
  "participants": [
    {
      "id": "user_abc123",
      "name": "John Doe",
      "joinedAt": "2025-07-13T22:00:00.000Z"
    }
  ],
  "keywords": [
    {
      "id": "keyword_xyz789",
      "text": "Starbucks",
      "category": "location",
      "addedBy": "user_abc123",
      "createdAt": "2025-07-13T22:01:00.000Z",
      "votes": [],
      "totalScore": 0
    }
  ]
}
```

#### Join Session
```http
POST /api/session/current/join
```

**Request Body:**
```json
{
  "name": "Jane Smith"
}
```

**Response:**
```json
{
  "sessionId": "current",
  "userId": "user_def456",
  "userCode": "456",
  "session": {
    // Full session object
  }
}
```

#### Rejoin Session
```http
POST /api/session/current/rejoin
```

**Request Body:**
```json
{
  "userCode": "123"
}
```

**Response:**
```json
{
  "userId": "user_abc123",
  "userCode": "123",
  "userData": {
    "name": "John Doe",
    "isCreator": true,
    "isAdmin": true
  },
  "sessionData": {
    // Full session object
  }
}
```

**Error Response (Invalid Code):**
```json
{
  "error": "User code \"999\" not found in this session. Please check your code or join as a new participant."
}
```

#### Delete Session (Admin Only)
```http
DELETE /api/session/current
```

**Headers:**
```
Authorization: Bearer {userId}
```

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

**Error Response (Non-Admin):**
```json
{
  "success": false,
  "message": "Only the session admin can delete the session"
}
```

### Keywords

#### Add Keyword
```http
POST /api/session/current/keywords
```

**Request Body:**
```json
{
  "userId": "user_abc123",
  "text": "Central Park",
  "category": "location"
}
```

**Response:**
```json
{
  "id": "keyword_xyz789",
  "text": "Central Park",
  "category": "location",
  "addedBy": "user_abc123",
  "createdAt": "2025-07-13T22:01:00.000Z"
}
```

### Voting

#### Vote on Keyword
```http
POST /api/session/current/vote
```

**Request Body:**
```json
{
  "userId": "user_abc123",
  "keywordId": "keyword_xyz789",
  "value": 1  // 1 for upvote, -1 for downvote
}
```

**Response:**
```json
{
  "keywordId": "keyword_xyz789",
  "totalScore": 2,
  "votes": [
    {
      "userId": "user_abc123",
      "value": 1,
      "timestamp": "2025-07-13T22:02:00.000Z"
    }
  ]
}
```

## Socket.io Events

### Connection

Connect to the Socket.io server:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');
```

### Client → Server Events

#### Join Session Room
```javascript
socket.emit('join-session', {
  sessionId: 'current',
  userId: 'user_abc123'
});
```

### Server → Client Events

#### Keyword Added
```javascript
socket.on('keyword-added', (data) => {
  console.log('New keyword:', data);
  // data: KeywordData object
});
```

#### Vote Updated
```javascript
socket.on('vote-updated', (data) => {
  console.log('Vote updated:', data);
  // data: { keywordId, totalScore, votes }
});
```

#### User Joined
```javascript
socket.on('user-joined', (data) => {
  console.log('User joined:', data);
  // data: { userId, name, sessionId }
});
```

### Important Notes

#### Real-time Event Filtering
The frontend automatically filters out events from the current user to prevent duplicate displays:
```javascript
socket.on('keyword-added', (keywordData) => {
  const currentUser = useSessionStore.getState().user;

  // Only add if it's not from the current user (prevents duplicates)
  if (!currentUser || keywordData.addedBy !== currentUser.id) {
    addKeywordToUI(keywordData);
  }
});
```

#### Connection Stability
Socket.io connections use these settings for reliability:
```javascript
const socket = io(serverUrl, {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});
```

## User Code System

### Overview
Each user gets a unique 3-digit code (e.g., 123, 456) for easy session rejoining.

### Features
- **Memorable**: Easy-to-remember 3-digit numeric codes
- **Unique**: Each user gets a unique code within their session
- **Persistent**: Use codes to rejoin sessions after browser refresh/close
- **Admin Status**: Session creators maintain admin privileges when rejoining

### Usage
1. **Create Session**: Get your user code when creating a session
2. **Remember Code**: Note your 3-digit code for future access
3. **Rejoin**: Use the code to rejoin the session with your original identity
4. **Share**: Other users get their own unique codes when joining

## Data Types

### Session
```typescript
interface Session {
  id: string;
  description: string;
  createdAt: string;
  participants: Participant[];
  keywords: KeywordData[];
}
```

### Participant
```typescript
interface Participant {
  id: string;
  name: string;
  joinedAt: string;
}
```

### KeywordData
```typescript
interface KeywordData {
  id: string;
  text: string;
  category: 'food' | 'location' | 'activity' | 'time';
  addedBy: string;
  createdAt: string;
  votes: Vote[];
  totalScore: number;
}
```

### Vote
```typescript
interface Vote {
  userId: string;
  value: 1 | -1;
  timestamp: string;
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. This should be added for production use.

## CORS

CORS is enabled for all origins in development. For production, configure specific allowed origins.
