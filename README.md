# 🤝 letscatchup.ai

Collaborative meeting planner for friends - Real-time scheduling made simple.

## 🚀 Features

### 🎯 Core Collaboration
- **Real-time Collaboration**: Multiple users can contribute ideas simultaneously
- **Smart Categorization**: AI-powered keyword categorization (food, location, activity, time)
- **Voting System**: Democratic decision making with real-time vote tallies
- **Live Updates**: See changes instantly without page refreshes
- **Instant UI Updates**: Immediate feedback without waiting for server responses

### 👥 User Management
- **3-Digit User Codes**: Easy-to-remember codes for rejoining sessions
- **Session Persistence**: Users can rejoin sessions after browser refresh/close
- **Admin Controls**: Session creators get admin privileges with delete capabilities
- **User Identity**: Persistent user identity across browser sessions
- **Name Conflict Detection**: Prevents duplicate names in sessions

### 🔄 Session Management
- **Create or Rejoin**: Choose between creating new sessions or rejoining existing ones
- **Session Codes**: Unique 3-digit codes for easy session access
- **Admin Dashboard**: Session creators can manage and delete sessions
- **Multi-user Support**: Handle multiple concurrent users seamlessly
- **Real-time Synchronization**: All users see updates instantly without duplicates

## ✨ Recent Improvements

### 🎯 User Experience Enhancements
- **Seamless Rejoining**: Users can now easily return to sessions using memorable 3-digit codes
- **No More Duplicates**: Fixed the issue where users saw their own keywords twice
- **Stable Connections**: Improved Socket.io connection reliability for consistent real-time updates
- **Admin Controls**: Session creators can now manage and delete sessions when planning is complete

### 🔧 Technical Improvements
- **Enhanced Socket.io**: Removed connection instability issues and improved reconnection handling
- **Data Structure Consistency**: Fixed mismatches between frontend and backend data structures
- **User State Persistence**: Users maintain their identity across browser sessions
- **Real-time Event Filtering**: Prevents duplicate events and ensures clean user experience

### 🚀 Collaboration Features
- **Multi-user Support**: Robust handling of multiple concurrent users in sessions
- **Real-time Synchronization**: Instant keyword propagation across all connected users
- **Session Management**: Complete session lifecycle management with proper cleanup
- **User Identification**: Unique user codes for easy session access and identity management

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom design system
- **Zustand** for state management
- **Socket.io Client** for real-time communication
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Socket.io** for real-time WebSocket communication
- **Ollama** for local LLM integration (keyword categorization)
- **In-memory storage** (sessions and data)
- **CORS** enabled for cross-origin requests

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Ollama** (for LLM features)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/sshindesiddesh/letscatchup.git
cd letscatchup
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Set Up Ollama (Optional - for AI categorization)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the required model
ollama pull llama3
```

### 4. Start the Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Open the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🎯 How to Use

### 🚀 Getting Started

1. **Choose Your Mode**
   - **Create New Session**: Start a fresh planning session
   - **Rejoin Session**: Use your 3-digit code to return to an existing session

2. **Create a Session** (New Users)
   - Enter a session description (e.g., "Coffee meetup planning")
   - Enter your name
   - Click "Create Session"
   - **Remember your 3-digit code** - you'll need it to rejoin!

3. **Rejoin a Session** (Returning Users)
   - Click "🔄 Rejoin Session" on the home page
   - Enter your 3-digit code
   - You'll be back in your session with your original identity

### 💡 Collaborating

4. **Add Keywords**
   - Type keywords related to your meetup (e.g., "Starbucks", "Saturday 2pm")
   - Select appropriate category or let AI categorize automatically
   - Keywords appear instantly for all participants (no duplicates!)

5. **Vote on Ideas**
   - Click 👍 or 👎 on any keyword
   - See real-time vote tallies
   - Most popular ideas rise to the top

6. **Real-time Collaboration**
   - Share your session code with friends
   - Everyone sees updates instantly
   - No page refreshes needed
   - Each user gets their own unique 3-digit code

### 👑 Admin Features

7. **Session Management** (Admin Only)
   - Session creators get admin privileges (👑 badge)
   - Delete sessions when planning is complete
   - Manage session participants

## 🏗️ Project Structure

```
letscatchup/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── index.ts        # Main server file
│   │   ├── routes/         # API routes
│   │   │   └── session.ts  # Session management routes
│   │   ├── sockets/        # Socket.io handlers
│   │   │   └── sessionSocket.ts # Real-time session events
│   │   ├── services/       # Business logic
│   │   │   └── llmService.ts # LLM integration
│   │   └── types/          # TypeScript types
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── CreateSession.tsx
│   │   │   ├── SessionPage.tsx
│   │   │   ├── JoinSession.tsx
│   │   │   └── DebugTest.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useSession.ts
│   │   ├── services/       # API and Socket services
│   │   │   ├── apiService.ts
│   │   │   └── socketService.ts
│   │   ├── store/          # Zustand state management
│   │   │   └── sessionStore.ts
│   │   └── types/          # TypeScript types
│   └── package.json
├── docs/                   # Documentation
└── README.md
```

## 🔧 Development

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables

**Backend (.env):**
```env
PORT=3001
NODE_ENV=development
OLLAMA_BASE_URL=http://localhost:11434
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3001
```

### Development Features

- **Hot Reload**: Both frontend and backend support hot reloading
- **Debug Mode**: Comprehensive logging for development
- **Debug Route**: `/debug` route for testing Socket.io functionality
- **TypeScript**: Full type safety across the stack

## 🔍 API Documentation

### REST Endpoints

#### Session Management
- `POST /api/session/create` - Create a new session
  - Returns: `{ sessionId, shareLink, userId, userCode }`
- `GET /api/session/current` - Get current session data
- `DELETE /api/session/current` - Delete session (admin only)

#### User Management
- `POST /api/session/current/join` - Join current session as new user
  - Body: `{ name }`
  - Returns: `{ userId, userCode, sessionData }`
- `POST /api/session/current/rejoin` - Rejoin session with user code
  - Body: `{ userCode }`
  - Returns: `{ userId, userCode, userData, sessionData }`

#### Content Management
- `POST /api/session/current/keywords` - Add keyword to session
  - Body: `{ userId, text, category }`
- `POST /api/session/current/vote` - Vote on a keyword
  - Body: `{ userId, keywordId, value }`

### Socket.io Events

**Client → Server:**
- `join-session` - Join a session room
  - Data: `{ sessionId, userId }`

**Server → Client:**
- `keyword-added` - New keyword added by any user
  - Data: `KeywordData` object
- `vote-updated` - Vote count changed
  - Data: `{ keywordId, totalScore, votes }`
- `user-joined` - User joined session
  - Data: `{ userId, userName }`

### User Codes System

- **3-digit codes**: Easy-to-remember numeric codes (e.g., 123, 456)
- **Unique per session**: Each user gets a unique code within their session
- **Persistent identity**: Use codes to rejoin and maintain user identity
- **Admin privileges**: Session creators get admin status

## 🚀 Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set environment variables for production
3. Start with: `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Serve the `dist` folder with any static file server

## 🐛 Troubleshooting

### Common Issues

1. **Socket.io Connection Issues**
   - Check if backend is running on port 3001
   - Verify CORS settings
   - Check browser console for connection errors
   - Look for "🔌 Socket.io connection" logs in browser console

2. **Real-time Updates Not Working**
   - Ensure Socket.io connections are stable
   - Check for "💡 New keyword added via Socket.io" logs
   - Verify users are in the same session room
   - Look for "🚫 Ignoring own keyword" logs (this is normal)

3. **User Code Issues**
   - **Invalid code error**: Check if the 3-digit code is correct
   - **Session not found**: The session may have been deleted by admin
   - **Code format**: Ensure code is exactly 3 digits (e.g., 123, not 12 or 1234)

4. **Duplicate Keywords Appearing**
   - This should be fixed - check browser console for filtering logs
   - Clear browser cache and refresh if issues persist

5. **LLM Categorization Not Working**
   - Ensure Ollama is installed and running
   - Check if `llama3` model is pulled
   - Verify `OLLAMA_BASE_URL` environment variable

6. **Admin Controls Not Visible**
   - Only session creators get admin privileges (👑 badge)
   - Check if you're the original session creator
   - Admin status is tied to the user who created the session

### Debug Tools

- **Browser Console**: Check for detailed real-time event logs
  - Socket.io connection status
  - Keyword addition/filtering logs
  - User code validation messages
- **Backend Logs**: Monitor terminal for comprehensive event tracking
  - Session creation and user management
  - Socket.io room management
  - Real-time broadcasting status
- **Network Tab**: Monitor API calls and WebSocket connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for better collaborative planning tools
- Thanks to the open-source community for amazing tools and libraries
