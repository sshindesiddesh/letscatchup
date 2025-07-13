# API Reference

> Complete REST API and Socket.io event documentation for letscatchup.ai

## 🌐 REST API Endpoints

**Base URL**: `http://localhost:3001/api`

### 🏥 Health Check
```http
GET /session/health
```

**Response**:
```json
{
  "status": "ok",
  "hasActiveSession": true,
  "sessionId": "current",
  "participantCount": 2,
  "keywordCount": 5
}
```

### 📝 Create Session
```http
POST /session/create
Content-Type: application/json

{
  "description": "weekend brunch with college friends downtown",
  "creatorName": "Sarah"
}
```

**Response**:
```json
{
  "sessionId": "current",
  "shareLink": "/join/current",
  "userId": "user_abc123"
}
```

### 👋 Join Session
```http
POST /session/:sessionId/join
Content-Type: application/json

{
  "name": "Mike"
}
```

**Response**:
```json
{
  "userId": "user_def456",
  "sessionData": {
    "id": "current",
    "description": "weekend brunch with college friends downtown",
    "participants": [...],
    "keywords": [...],
    "consensus": { "finalized": [], "pending": [] },
    "status": "active",
    "createdAt": "2025-07-13T14:00:00.000Z",
    "expiresAt": "2025-07-14T14:00:00.000Z"
  }
}
```

### 📊 Get Session Data
```http
GET /session/:sessionId
```

**Response**: Same `sessionData` object as join response

### 💡 Add Keyword
```http
POST /session/:sessionId/keywords
Content-Type: application/json

{
  "userId": "user_abc123",
  "text": "Saturday 11AM",
  "category": "time"
}
```

**Response**:
```json
{
  "id": "keyword_xyz789",
  "text": "Saturday 11AM",
  "category": "time",
  "addedBy": "user_abc123",
  "createdAt": "2025-07-13T14:05:00.000Z"
}
```

### 🗳️ Vote on Keyword
```http
POST /session/:sessionId/vote
Content-Type: application/json

{
  "userId": "user_def456",
  "keywordId": "keyword_xyz789",
  "value": 1
}
```

**Response**:
```json
{
  "keywordId": "keyword_xyz789",
  "totalScore": 1,
  "voteCount": 1,
  "userVote": 1
}
```

### 👥 Get Participants
```http
GET /session/:sessionId/participants
```

**Response**:
```json
{
  "participants": [
    {
      "id": "user_abc123",
      "name": "Sarah",
      "joinedAt": "2025-07-13T14:00:00.000Z",
      "isCreator": true
    },
    {
      "id": "user_def456", 
      "name": "Mike",
      "joinedAt": "2025-07-13T14:02:00.000Z",
      "isCreator": false
    }
  ]
}
```

## 🔌 Socket.io Events

**Connection URL**: `http://localhost:3001`

### 📤 Client to Server Events

#### Join Session Room
```javascript
socket.emit('join-session', {
  sessionId: 'current',
  userId: 'user_abc123'
});
```

#### Add Keyword (Real-time)
```javascript
socket.emit('add-keyword', {
  sessionId: 'current',
  userId: 'user_abc123',
  text: 'Central Park',
  category: 'location'
});
```

#### Vote (Real-time)
```javascript
socket.emit('vote', {
  sessionId: 'current',
  userId: 'user_abc123',
  keywordId: 'keyword_xyz789',
  value: 1
});
```

#### Typing Indicator
```javascript
socket.emit('typing', {
  sessionId: 'current',
  userId: 'user_abc123',
  isTyping: true
});
```

### 📥 Server to Client Events

#### Session Updated
```javascript
socket.on('session-updated', (sessionData) => {
  // Complete session state
  console.log('Session updated:', sessionData);
});
```

#### Participant Events
```javascript
socket.on('participant-joined', (participant) => {
  console.log('New participant:', participant.name);
});

socket.on('participant-offline', (data) => {
  console.log('User offline:', data.name);
});

socket.on('participant-count-updated', (data) => {
  console.log('Participants:', data.total, 'Online:', data.online);
});
```

#### Keyword Events
```javascript
socket.on('keyword-added', (data) => {
  console.log('New keyword:', data.keyword.text);
});

socket.on('vote-updated', (data) => {
  console.log('Vote update:', data.keywordId, 'Score:', data.totalScore);
});

socket.on('consensus-reached', (data) => {
  console.log('Consensus reached!', data.keywords);
});
```

#### Session Statistics
```javascript
socket.on('session-stats-updated', (data) => {
  console.log('Stats:', data.stats);
});
```

#### Typing Indicators
```javascript
socket.on('user-typing', (data) => {
  console.log('User typing:', data.userId, data.isTyping);
});
```

#### Error Handling
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});

socket.on('system-message', (data) => {
  console.log('System:', data.message);
});
```

## 🔄 Real-time Broadcasting

### Automatic Broadcasts

When API endpoints are called, the following Socket.io events are automatically broadcast:

| API Endpoint | Triggered Socket Events |
|--------------|------------------------|
| `POST /session/:id/join` | `session-updated`, `session-stats-updated` |
| `POST /session/:id/keywords` | `keyword-added`, `session-stats-updated` |
| `POST /session/:id/vote` | `vote-updated`, `session-stats-updated` |

### Manual Socket Events

Direct Socket.io events bypass the REST API and provide immediate real-time updates:

- `add-keyword` → `keyword-added` broadcast
- `vote` → `vote-updated` broadcast  
- `typing` → `user-typing` broadcast

## 🚨 Error Responses

### HTTP Error Codes
- `400 Bad Request`: Missing or invalid parameters
- `404 Not Found`: Session or resource not found
- `500 Internal Server Error`: Server-side error

### Socket.io Errors
```javascript
socket.on('error', (error) => {
  // error.message contains human-readable error description
});
```

Common error messages:
- `"Invalid session or user"`
- `"Failed to add keyword"`
- `"Failed to submit vote"`
- `"Vote value must be 1 or -1"`
- `"Invalid category"`

## 🧪 Testing Examples

### Complete User Flow Test
```bash
# 1. Create session
curl -X POST http://localhost:3001/api/session/create \
  -H "Content-Type: application/json" \
  -d '{"description": "weekend brunch", "creatorName": "Sarah"}'

# 2. Join session
curl -X POST http://localhost:3001/api/session/current/join \
  -H "Content-Type: application/json" \
  -d '{"name": "Mike"}'

# 3. Add keyword
curl -X POST http://localhost:3001/api/session/current/keywords \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_abc123", "text": "Saturday 11AM", "category": "time"}'

# 4. Vote on keyword
curl -X POST http://localhost:3001/api/session/current/vote \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_def456", "keywordId": "keyword_xyz789", "value": 1}'
```

### Socket.io Test Client
```bash
cd backend
node test-socket-client.js
```

---

**Server**: `backend/src/routes/session.ts`, `backend/src/sockets/sessionSocket.ts`  
**Last Updated**: 2025-07-13
