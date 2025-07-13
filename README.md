# 🤝 letscatchup.ai

Collaborative meeting planner for friends - Real-time scheduling made simple.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can contribute ideas simultaneously
- **Smart Categorization**: AI-powered keyword categorization (food, location, activity, time)
- **Voting System**: Democratic decision making with real-time vote tallies
- **Session Management**: Create and join planning sessions with ease
- **Live Updates**: See changes instantly without page refreshes
- **Instant UI Updates**: Immediate feedback without waiting for server responses

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
- Frontend: http://localhost:3003
- Backend API: http://localhost:3001

## 🎯 How to Use

1. **Create a Session**
   - Enter a session description (e.g., "Coffee meetup planning")
   - Enter your name
   - Click "Create Session"

2. **Add Keywords**
   - Type keywords related to your meetup (e.g., "Starbucks", "Saturday 2pm")
   - Select appropriate category or let AI categorize automatically
   - Keywords appear instantly for all participants

3. **Vote on Ideas**
   - Click 👍 or 👎 on any keyword
   - See real-time vote tallies
   - Most popular ideas rise to the top

4. **Collaborate in Real-time**
   - Share the session with friends
   - Everyone sees updates instantly
   - No page refreshes needed

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

- `POST /api/session/create` - Create a new session
- `GET /api/session/current` - Get current session data
- `POST /api/session/current/join` - Join current session
- `POST /api/session/current/keywords` - Add keyword to session
- `POST /api/session/current/vote` - Vote on a keyword

### Socket.io Events

**Client → Server:**
- `join-session` - Join a session room
- `keyword-added` - Broadcast new keyword
- `vote-updated` - Broadcast vote changes

**Server → Client:**
- `keyword-added` - New keyword added
- `vote-updated` - Vote count changed
- `user-joined` - User joined session

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

2. **LLM Categorization Not Working**
   - Ensure Ollama is installed and running
   - Check if `llama3` model is pulled
   - Verify `OLLAMA_BASE_URL` environment variable

3. **Performance Issues**
   - Check for infinite loops in browser console
   - Monitor backend logs for excessive Socket.io events
   - Use the `/debug` route to test functionality

### Debug Tools

- **Debug Route**: Visit `/debug` for Socket.io testing
- **Browser Console**: Check for real-time event logs
- **Backend Logs**: Monitor terminal for detailed event tracking

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
