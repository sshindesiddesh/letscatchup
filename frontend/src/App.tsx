import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/session/:sessionId" element={<SessionPage />} />
        </Routes>
      </div>
    </Router>
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
          <p className="text-sm text-gray-500">
            Project structure initialized! 🎉
            <br />
            Ready for development.
          </p>
        </div>
      </div>
    </div>
  )
}

function SessionPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Session Page</h2>
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  )
}

export default App
