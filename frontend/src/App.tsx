import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useSessionConnection } from './hooks/useSession'
import { useUIState } from './store/sessionStore'
import SessionTest from './components/SessionTest'
import CreateSession from './components/CreateSession'
import SessionPage from './components/SessionPage'
import JoinSession from './components/JoinSession'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
      </div>
    </Router>
  )
}

function AppContent() {
  // Initialize session connection management
  useSessionConnection();
  const { isConnected, error } = useUIState();

  return (
    <>
      {/* Connection Status Bar */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <div className="flex items-center justify-center">
            <span className="text-red-600 text-sm">⚠️ {error}</span>
          </div>
        </div>
      )}

      {!isConnected && !error && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="flex items-center justify-center">
            <span className="text-yellow-600 text-sm">🔄 Connecting...</span>
          </div>
        </div>
      )}

      {/* Main Routes */}
      <Routes>
        <Route path="/" element={<CreateSession />} />
        <Route path="/test" element={<SessionTest />} />
        <Route path="/session/:sessionId" element={<SessionPageWrapper />} />
        <Route path="/join/:sessionId" element={<JoinPageWrapper />} />
        <Route path="/demo" element={<HomePage />} />
      </Routes>
    </>
  )
}

// Placeholder components - we'll build these in later tasks
function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🤝 letscatchup.ai
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Collaborative meeting planner for friends
        </p>
        <div className="card max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4">Frontend Foundation Complete! 🎉</h3>
          <div className="text-left space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              React + TypeScript + Vite
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Tailwind CSS with custom design system
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Zustand state management
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Socket.io real-time communication
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              API service with error handling
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Custom hooks for session management
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3">
              Ready for UI component development!
            </p>
            <a
              href="/test"
              className="inline-block btn-primary text-sm"
            >
              🧪 Test Real-time Features
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function SessionPageWrapper() {
  return <SessionPage />;
}

function JoinPageWrapper() {
  return <JoinSession />;
}

export default App
