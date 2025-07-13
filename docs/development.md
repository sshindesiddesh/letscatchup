# Development Guide

> Setup, testing, and contribution guidelines for letscatchup.ai

## 🚀 Quick Setup

### Prerequisites
- **Node.js** 18+
- **npm** or **yarn**
- **Git**
- **Ollama** (optional, for LLM features)

### Full Stack Setup
```bash
# Clone repository
git clone https://github.com/sshindesiddesh/letscatchup.git
cd letscatchup

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start backend (Terminal 1)
cd backend && npm run dev

# Start frontend (Terminal 2)
cd frontend && npm run dev
```

### Access Points
- **Frontend**: http://localhost:3003
- **Backend API**: http://localhost:3001
- **Debug Route**: http://localhost:3003/debug

### Verify Installation
```bash
# Test backend health
curl http://localhost:3001/api/session/current

# Test frontend
open http://localhost:3003
```

## 🧪 Testing

### API Testing
```bash
# Run complete API test flow
cd backend
chmod +x test-api.sh
./test-api.sh
```

### Socket.io Testing
```bash
# Test real-time features
cd backend
node test-socket-client.js
```

### Manual Testing Flow
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

## 📁 Project Structure

```
letscatchup/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── models/
│   │   │   └── types.ts        # TypeScript interfaces
│   │   ├── services/
│   │   │   └── SessionManager.ts # Business logic
│   │   ├── routes/
│   │   │   └── session.ts      # REST API endpoints
│   │   ├── sockets/
│   │   │   └── sessionSocket.ts # Socket.io handlers
│   │   └── index.ts            # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── test-socket-client.js   # Socket.io test client
├── frontend/                   # React frontend (future)
├── docs/                       # Documentation
│   ├── README.md
│   ├── architecture.md
│   ├── data-structures.md
│   ├── api-reference.md
│   ├── control-flow.md
│   ├── design-decisions.md
│   ├── templates.md
│   └── development.md
├── docker-compose.yml          # Development environment (future)
├── LICENSE                     # MIT License
└── README.md                   # Project overview
```

## 🔧 Development Workflow

### Adding New Features

1. **Define Types** (if needed)
```typescript
// backend/src/models/types.ts
export interface NewFeature {
  id: string;
  // ... properties
}
```

2. **Update SessionManager**
```typescript
// backend/src/services/SessionManager.ts
newFeatureOperation(sessionId: string, ...params) {
  // Business logic
}
```

3. **Add API Endpoint**
```typescript
// backend/src/routes/session.ts
sessionRouter.post('/new-endpoint', (req, res) => {
  // Handle request
});
```

4. **Add Socket.io Events** (if real-time)
```typescript
// backend/src/sockets/sessionSocket.ts
socket.on('new-event', (data) => {
  // Handle real-time event
});
```

5. **Test Implementation**
```bash
# Test API endpoint
curl -X POST http://localhost:3001/api/session/new-endpoint

# Test Socket.io event
# Update test-socket-client.js
```

### Code Style Guidelines

#### TypeScript
```typescript
// Use explicit types
interface SessionData {
  id: string;
  description: string;
}

// Use const assertions for immutable data
const CATEGORIES = ['time', 'location', 'food', 'activity'] as const;

// Use proper error handling
try {
  const result = sessionManager.operation();
  return res.status(200).json(result);
} catch (error) {
  console.error('Operation failed:', error);
  return res.status(500).json({ error: 'Internal server error' });
}
```

#### Naming Conventions
```typescript
// Classes: PascalCase
class SessionManager {}

// Functions/Variables: camelCase
const sessionManager = new SessionManager();
function createSession() {}

// Constants: UPPER_SNAKE_CASE
const MAX_SESSION_DURATION = 24 * 60 * 60 * 1000;

// Types/Interfaces: PascalCase
interface PlanningSession {}
type CategoryType = 'time' | 'location';
```

## 🐛 Debugging

### Server Logs
```bash
# Development server shows detailed logs
npm run dev

# Look for these log patterns:
# 📝 Session created: "description" by Creator
# 👋 User joined session: description  
# 💡 User added keyword: "text" (category)
# 🗳️ User voted +1/-1 on "keyword"
# 🔌 User connected/disconnected: socketId
```

### Common Issues

#### "Cannot find module" errors
```bash
# Ensure all dependencies are installed
cd backend
npm install

# Check TypeScript compilation
npx tsc --noEmit
```

#### Socket.io connection issues
```bash
# Verify server is running
curl http://localhost:3001/api/session/health

# Check CORS configuration in index.ts
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});
```

#### Session not found errors
```bash
# Check if session exists
curl http://localhost:3001/api/session/current

# Create session first
curl -X POST http://localhost:3001/api/session/create \
  -H "Content-Type: application/json" \
  -d '{"description": "test", "creatorName": "Test"}'
```

## 📦 Dependencies

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",           // Web framework
    "socket.io": "^4.7.2",         // Real-time communication
    "cors": "^2.8.5",              // Cross-origin requests
    "morgan": "^1.10.0",           // HTTP logging
    "uuid": "^9.0.0"               // Unique ID generation
  },
  "devDependencies": {
    "typescript": "^5.0.0",        // TypeScript compiler
    "ts-node": "^10.9.0",          // TypeScript execution
    "nodemon": "^3.0.0",           // Development auto-reload
    "@types/express": "^4.17.17",  // Express types
    "@types/cors": "^2.8.13",      // CORS types
    "@types/morgan": "^1.9.4",     // Morgan types
    "@types/uuid": "^9.0.2"        // UUID types
  }
}
```

### Adding New Dependencies
```bash
# Production dependency
npm install package-name

# Development dependency  
npm install --save-dev package-name

# Update package.json and commit changes
git add package.json package-lock.json
git commit -m "Add package-name dependency"
```

## 🚀 Deployment

### Development
```bash
# Start development server
cd backend
npm run dev
```

### Production (Future)
```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Environment Variables
```bash
# .env file (future)
PORT=3001
NODE_ENV=development
SESSION_TIMEOUT=86400000  # 24 hours in ms
```

## 🤝 Contributing

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature: description"

# Push to GitHub
git push origin feature/new-feature

# Create pull request on GitHub
```

### Commit Message Format
```
Add feature: brief description

- Detailed change 1
- Detailed change 2
- Any breaking changes

Closes #issue-number
```

### Pull Request Checklist
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages are clear

## 📚 Learning Resources

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express with TypeScript](https://blog.logrocket.com/how-to-set-up-node-typescript-express/)

### Socket.io
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Socket.io with TypeScript](https://socket.io/docs/v4/typescript/)

### Node.js Best Practices
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Need Help?** Check the [API Reference](./api-reference.md) or [Templates](./templates.md)  
**Last Updated**: 2025-07-13
