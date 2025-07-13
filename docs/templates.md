# Templates & Code Examples

> Reusable code templates and practical examples for letscatchup.ai development

## 🚀 Quick Start Templates

### Backend Server Setup
```typescript
// index.ts - Complete server setup
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.use('/api/session', sessionRouter);

// Socket.io
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### SessionManager Service Template
```typescript
// services/SessionManager.ts
export class SessionManager {
  private currentSession: PlanningSession | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    setInterval(() => this.cleanupExpiredSession(), 60 * 60 * 1000);
  }

  createSession(description: string, creatorName: string) {
    // Implementation
  }

  joinSession(sessionId: string, name: string) {
    // Implementation  
  }

  addKeyword(sessionId: string, userId: string, text: string, category: CategoryType) {
    // Implementation
  }

  vote(sessionId: string, userId: string, keywordId: string, value: VoteValue) {
    // Implementation
  }
}

export const sessionManager = new SessionManager();
```

## 🔌 Socket.io Templates

### Server-Side Socket Handler
```typescript
// sockets/sessionSocket.ts
export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on('join-session', (data: { sessionId: string; userId: string }) => {
      const { sessionId, userId } = data;
      
      // Validate and join room
      const session = sessionManager.getSession(sessionId);
      if (!session || !session.participants.has(userId)) {
        socket.emit('error', { message: 'Invalid session or user' });
        return;
      }

      socket.join(sessionId);
      socket.emit('session-updated', sessionManager.serializeSession(session));
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
      // Cleanup logic
    });
  });
}
```

### Client-Side Socket Connection
```typescript
// Frontend socket client template
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io('http://localhost:3001');
    
    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    this.socket.on('session-updated', (sessionData) => {
      // Update UI state
    });

    this.socket.on('keyword-added', (data) => {
      // Handle new keyword
    });

    this.socket.on('vote-updated', (data) => {
      // Update vote display
    });
  }

  joinSession(sessionId: string, userId: string) {
    this.socket?.emit('join-session', { sessionId, userId });
  }

  addKeyword(sessionId: string, userId: string, text: string, category: string) {
    this.socket?.emit('add-keyword', { sessionId, userId, text, category });
  }

  vote(sessionId: string, userId: string, keywordId: string, value: number) {
    this.socket?.emit('vote', { sessionId, userId, keywordId, value });
  }
}

export const socketService = new SocketService();
```

## 🌐 API Route Templates

### Express Route Handler Template
```typescript
// routes/session.ts
import { Router, Request, Response } from 'express';

export const sessionRouter = Router();

// Template for new endpoint
sessionRouter.post('/endpoint', (req: Request<ParamsType, ResponseType, BodyType>, res: Response<ResponseType>) => {
  try {
    // 1. Extract and validate parameters
    const { param1, param2 } = req.params;
    const { field1, field2 } = req.body;

    if (!field1 || !field2) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 2. Business logic
    const result = sessionManager.someOperation(param1, field1, field2);
    
    if (!result) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // 3. Real-time broadcasting (if needed)
    if (socketIO) {
      broadcastSomeEvent(param1, result.id, socketIO);
    }

    // 4. Return response
    return res.status(200).json(result);

  } catch (error) {
    console.error('Error in endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
```

## 📊 Data Model Templates

### TypeScript Interface Template
```typescript
// models/types.ts
export interface NewEntity {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  createdAt: Date;              // Creation timestamp
  updatedAt?: Date;             // Last update (optional)
  metadata?: Record<string, any>; // Flexible metadata
}

export interface NewEntityData {
  id: string;
  name: string;
  createdAt: string;            // ISO string for API
  updatedAt?: string;
  metadata?: Record<string, any>;
}

// Request/Response types
export interface CreateNewEntityRequest {
  name: string;
  metadata?: Record<string, any>;
}

export interface CreateNewEntityResponse {
  id: string;
  name: string;
  createdAt: string;
}
```

### Map-Based Storage Pattern
```typescript
// Service class with Map storage
export class EntityManager {
  private entities: Map<string, Entity> = new Map();

  create(data: CreateEntityData): Entity {
    const id = this.generateId();
    const entity: Entity = {
      id,
      ...data,
      createdAt: new Date()
    };
    
    this.entities.set(id, entity);
    return entity;
  }

  get(id: string): Entity | null {
    return this.entities.get(id) || null;
  }

  update(id: string, updates: Partial<Entity>): Entity | null {
    const entity = this.entities.get(id);
    if (!entity) return null;

    const updated = { ...entity, ...updates, updatedAt: new Date() };
    this.entities.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.entities.delete(id);
  }

  list(): Entity[] {
    return Array.from(this.entities.values());
  }

  private generateId(): string {
    return `entity_${uuidv4().slice(0, 8)}`;
  }
}
```

## 🧪 Testing Templates

### API Endpoint Test
```bash
#!/bin/bash
# test-api.sh - API testing script

BASE_URL="http://localhost:3001/api"

echo "🧪 Testing API Endpoints"

# Test health check
echo "1. Health Check"
curl -s "$BASE_URL/session/health" | jq

# Test session creation
echo "2. Create Session"
RESPONSE=$(curl -s -X POST "$BASE_URL/session/create" \
  -H "Content-Type: application/json" \
  -d '{"description": "test meetup", "creatorName": "Test User"}')
echo $RESPONSE | jq

# Extract session ID and user ID
SESSION_ID=$(echo $RESPONSE | jq -r '.sessionId')
USER_ID=$(echo $RESPONSE | jq -r '.userId')

# Test joining session
echo "3. Join Session"
curl -s -X POST "$BASE_URL/session/$SESSION_ID/join" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Friend"}' | jq

echo "✅ API tests complete"
```

### Socket.io Test Client
```javascript
// test-socket.js - Socket.io testing
const { io } = require('socket.io-client');

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
  
  // Test sequence
  setTimeout(() => testJoinSession(), 1000);
  setTimeout(() => testAddKeyword(), 2000);
  setTimeout(() => testVoting(), 3000);
});

function testJoinSession() {
  console.log('🧪 Testing join session');
  socket.emit('join-session', {
    sessionId: 'current',
    userId: 'test-user'
  });
}

function testAddKeyword() {
  console.log('🧪 Testing add keyword');
  socket.emit('add-keyword', {
    sessionId: 'current',
    userId: 'test-user',
    text: 'Test Location',
    category: 'location'
  });
}

function testVoting() {
  console.log('🧪 Testing voting');
  socket.emit('vote', {
    sessionId: 'current',
    userId: 'test-user',
    keywordId: 'test-keyword',
    value: 1
  });
}

// Event listeners
socket.on('session-updated', (data) => console.log('📊 Session updated'));
socket.on('keyword-added', (data) => console.log('💡 Keyword added:', data));
socket.on('vote-updated', (data) => console.log('🗳️ Vote updated:', data));
socket.on('error', (error) => console.log('🚨 Error:', error));
```

## 🎨 Frontend Component Templates

### React Hook for Session Management
```typescript
// hooks/useSession.ts
import { useState, useEffect } from 'react';
import { socketService } from '../services/socket';

export function useSession(sessionId: string, userId: string) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Connect to socket
    socketService.connect();
    
    // Join session
    socketService.joinSession(sessionId, userId);

    // Event listeners
    socketService.on('session-updated', (sessionData) => {
      setSession(sessionData);
      setLoading(false);
    });

    socketService.on('error', (error) => {
      setError(error.message);
      setLoading(false);
    });

    return () => {
      socketService.disconnect();
    };
  }, [sessionId, userId]);

  const addKeyword = (text: string, category: string) => {
    socketService.addKeyword(sessionId, userId, text, category);
  };

  const vote = (keywordId: string, value: number) => {
    socketService.vote(sessionId, userId, keywordId, value);
  };

  return { session, loading, error, addKeyword, vote };
}
```

### React Component Template
```tsx
// components/SessionView.tsx
import React from 'react';
import { useSession } from '../hooks/useSession';

interface SessionViewProps {
  sessionId: string;
  userId: string;
}

export function SessionView({ sessionId, userId }: SessionViewProps) {
  const { session, loading, error, addKeyword, vote } = useSession(sessionId, userId);

  if (loading) return <div>Loading session...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!session) return <div>Session not found</div>;

  return (
    <div className="session-view">
      <h1>{session.description}</h1>
      
      <div className="participants">
        {session.participants.map(participant => (
          <div key={participant.id}>{participant.name}</div>
        ))}
      </div>

      <div className="keywords">
        {session.keywords.map(keyword => (
          <div key={keyword.id} className="keyword">
            <span>{keyword.text}</span>
            <button onClick={() => vote(keyword.id, 1)}>👍</button>
            <button onClick={() => vote(keyword.id, -1)}>👎</button>
            <span>Score: {keyword.totalScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

**Usage**: Copy and modify templates for new features  
**Last Updated**: 2025-07-13
