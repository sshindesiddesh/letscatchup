# Design Decisions & Technical Rationale

> Key architectural choices and reasoning behind letscatchup.ai implementation

## 🏗️ Architecture Decisions

### 1. **MVP Single Session Approach**
**Decision**: Use fixed session ID ('current') for MVP  
**Rationale**:
- Simplifies development and testing
- Reduces complexity for initial validation
- Easy to extend to multi-session later
- Focuses on core collaboration features

**Implementation**:
```typescript
// SessionManager.ts
const sessionId = 'current'; // MVP: fixed session ID
```

**Future Extension**:
```typescript
// Easy migration path
const sessionId = uuidv4(); // Generate unique IDs
```

### 2. **In-Memory Storage for MVP**
**Decision**: Use JavaScript Maps and objects instead of database  
**Rationale**:
- Zero setup complexity
- Perfect for MVP demonstration
- Fast development iteration
- No database configuration required
- Easy to migrate to persistent storage

**Trade-offs**:
- ✅ Pros: Simple, fast, no dependencies
- ❌ Cons: Data lost on restart, no persistence
- 🔄 Migration: Replace Maps with database queries

### 3. **24-Hour Session Expiration**
**Decision**: Automatic session cleanup after 24 hours  
**Rationale**:
- Prevents memory leaks in production
- Reasonable time for meetup planning
- Automatic resource management
- Encourages timely decision making

**Implementation**:
```typescript
const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
this.scheduleCleanup(expiresAt);
```

### 4. **TypeScript-First Development**
**Decision**: Complete type safety across all layers  
**Rationale**:
- Prevents runtime errors
- Better developer experience
- Self-documenting code
- Easier refactoring and maintenance

**Coverage**:
- API request/response types
- Socket.io event types
- Internal data structures
- Service layer interfaces

## 🔌 Real-time Communication

### 5. **Socket.io Over WebSockets**
**Decision**: Use Socket.io instead of raw WebSockets  
**Rationale**:
- Automatic fallback mechanisms
- Built-in room management
- Event-based architecture
- Better error handling
- Cross-browser compatibility

**Benefits**:
```typescript
// Room-based broadcasting
socket.to(sessionId).emit('keyword-added', data);

// Automatic reconnection
socket.on('disconnect', () => {
  // Cleanup and reconnection logic
});
```

### 6. **Dual API + Socket Approach**
**Decision**: Provide both REST API and Socket.io events  
**Rationale**:
- REST for traditional HTTP clients
- Sockets for real-time features
- Flexibility for different use cases
- Easy testing and debugging

**Pattern**:
```typescript
// API endpoint triggers Socket broadcast
app.post('/keywords', (req, res) => {
  const keyword = sessionManager.addKeyword(...);
  broadcastKeywordAdded(sessionId, keyword.id, io); // Real-time
  res.json(keyword); // HTTP response
});
```

## 🗳️ Voting & Consensus

### 7. **Simple +1/-1 Voting System**
**Decision**: Binary voting instead of complex scoring  
**Rationale**:
- Easy to understand and use
- Clear visual representation
- Reduces decision paralysis
- Works well on mobile interfaces

**Consensus Algorithm**:
```typescript
// Clear, simple thresholds
positiveRatio >= 0.6 && negativeRatio < 0.25
```

### 8. **60/25 Consensus Thresholds**
**Decision**: 60% positive, <25% negative for consensus  
**Rationale**:
- Balances majority preference with minority concerns
- Prevents single negative vote blocking
- Encourages participation
- Based on group decision research

**Alternative Considered**: Simple majority (50%+1)  
**Rejected**: Too easy to reach, doesn't ensure strong agreement

## 📊 Data Structure Choices

### 9. **Map-Based Storage**
**Decision**: Use JavaScript Maps for relationships  
**Rationale**:
- O(1) lookup performance
- Maintains insertion order
- Better than objects for dynamic keys
- Easy iteration and filtering

**Usage**:
```typescript
participants: Map<string, Participant>  // userId -> Participant
keywords: Map<string, Keyword>          // keywordId -> Keyword  
votes: Map<string, Vote>               // userId -> Vote
```

### 10. **Category-Based Keyword Organization**
**Decision**: Four fixed categories (time, location, food, activity)  
**Rationale**:
- Covers most meetup planning needs
- Simple to understand and use
- Easy to implement UI grouping
- Extensible for future categories

**Categories Chosen**:
- `time`: When to meet
- `location`: Where to meet  
- `food`: What/where to eat
- `activity`: What to do

## 🔄 State Management

### 11. **Server-Centric State**
**Decision**: Single source of truth on server  
**Rationale**:
- Prevents state synchronization issues
- Easier conflict resolution
- Consistent data across all clients
- Simpler client implementation

**Pattern**:
```typescript
// Server holds canonical state
sessionManager.getSession(sessionId)

// Clients receive updates via Socket.io
socket.emit('session-updated', sessionData);
```

### 12. **Event-Driven Updates**
**Decision**: Broadcast specific events instead of full state  
**Rationale**:
- Reduces bandwidth usage
- Enables granular UI updates
- Better user experience
- Easier to debug and monitor

**Event Types**:
- `keyword-added`: New keyword notification
- `vote-updated`: Vote score changes
- `consensus-reached`: Decision finalized
- `participant-joined`: User activity

## 🚀 Performance Considerations

### 13. **Lazy Consensus Checking**
**Decision**: Check consensus only after votes, not continuously  
**Rationale**:
- Reduces computational overhead
- Consensus is rare event
- Immediate feedback on voting
- Scales better with participants

### 14. **Minimal Data Serialization**
**Decision**: Transform Maps to Arrays only for API responses  
**Rationale**:
- Keep internal structure optimized
- Serialize only when needed
- Maintain performance for operations
- Clean API contracts

## 🔒 Security & Validation

### 15. **No Authentication for MVP**
**Decision**: Simple name-based participation  
**Rationale**:
- Reduces friction for MVP
- Focuses on core functionality
- Easy to add auth layer later
- Suitable for friend groups

**Future Security**:
- Add session passwords
- Implement user authentication
- Rate limiting for actions

### 16. **Input Validation at API Layer**
**Decision**: Validate all inputs before processing  
**Rationale**:
- Prevents invalid data corruption
- Clear error messages
- Type safety enforcement
- Security best practices

## 🎯 User Experience

### 17. **Natural Language Session Creation**
**Decision**: Free-form text input for meetup description  
**Rationale**:
- Intuitive for users
- Captures context and intent
- Flexible for any meetup type
- Prepares for LLM integration

### 18. **Real-time Feedback**
**Decision**: Immediate updates for all actions  
**Rationale**:
- Engaging user experience
- Reduces confusion about state
- Encourages participation
- Modern app expectations

## 🔮 Future-Proofing

### 19. **Modular Service Architecture**
**Decision**: Separate concerns into distinct services  
**Rationale**:
- Easy to test and maintain
- Clear responsibility boundaries
- Enables independent scaling
- Facilitates team development

**Structure**:
```
SessionManager    → Business logic
Routes           → API layer  
Socket handlers  → Real-time layer
Type definitions → Data contracts
```

### 20. **LLM-Ready Design**
**Decision**: Natural language input and category system  
**Rationale**:
- Prepares for AI integration
- Keyword categorization ready
- Context-aware processing
- Smart suggestion capabilities

**Integration Points**:
- Session description analysis
- Automatic keyword categorization
- Smart suggestion generation
- Conflict resolution assistance

---

**Review Date**: 2025-07-13  
**Next Review**: After frontend implementation
