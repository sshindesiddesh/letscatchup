/**
 * Simple Socket.io client test to demonstrate real-time features
 * Run with: node test-socket-client.js
 */

const { io } = require('socket.io-client');

// Connect to the Socket.io server
const socket = io('http://localhost:3001');

console.log('🔌 Connecting to Socket.io server...');

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to server with ID:', socket.id);
  
  // Test joining a session (assuming session 'current' exists)
  console.log('👋 Attempting to join session...');
  socket.emit('join-session', {
    sessionId: 'current',
    userId: 'test-user-socket'
  });
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.log('🚨 Connection error:', error.message);
});

// Session events
socket.on('session-updated', (sessionData) => {
  console.log('📊 Session updated:', {
    id: sessionData.id,
    participants: sessionData.participants.length,
    keywords: sessionData.keywords.length,
    status: sessionData.status
  });
});

socket.on('participant-joined', (participant) => {
  console.log('👋 New participant joined:', participant.name);
});

socket.on('participant-offline', (data) => {
  console.log('👋 Participant went offline:', data.name);
});

socket.on('participant-count-updated', (data) => {
  console.log('📊 Participant count updated:', data);
});

// Keyword events
socket.on('keyword-added', (data) => {
  console.log('💡 New keyword added:', {
    id: data.keywordId,
    text: data.keyword.text,
    category: data.keyword.category,
    addedBy: data.keyword.addedBy
  });
});

socket.on('vote-updated', (data) => {
  console.log('🗳️  Vote updated:', {
    keywordId: data.keywordId,
    totalScore: data.totalScore,
    voteCount: data.voteCount
  });
});

socket.on('consensus-reached', (data) => {
  console.log('🎯 Consensus reached!', {
    keywordIds: data.keywordIds,
    keywords: data.keywords.map(k => k.text)
  });
});

// Session statistics
socket.on('session-stats-updated', (data) => {
  console.log('📈 Session stats updated:', data.stats);
});

// Typing indicators
socket.on('user-typing', (data) => {
  console.log('⌨️  User typing:', data);
});

// Error handling
socket.on('error', (error) => {
  console.log('🚨 Socket error:', error.message);
});

// System messages
socket.on('system-message', (data) => {
  console.log('📢 System message:', data.message);
});

// Test real-time features after a delay
setTimeout(() => {
  console.log('\n🧪 Testing real-time features...');
  
  // Test adding a keyword via socket
  console.log('💡 Adding keyword via socket...');
  socket.emit('add-keyword', {
    sessionId: 'current',
    userId: 'test-user-socket',
    text: 'Central Park',
    category: 'location'
  });
  
  // Test voting via socket
  setTimeout(() => {
    console.log('🗳️  Voting via socket...');
    socket.emit('vote', {
      sessionId: 'current',
      userId: 'test-user-socket',
      keywordId: 'keyword_test', // This might not exist, but tests error handling
      value: 1
    });
  }, 2000);
  
  // Test typing indicator
  setTimeout(() => {
    console.log('⌨️  Testing typing indicator...');
    socket.emit('typing', {
      sessionId: 'current',
      userId: 'test-user-socket',
      isTyping: true
    });
    
    setTimeout(() => {
      socket.emit('typing', {
        sessionId: 'current',
        userId: 'test-user-socket',
        isTyping: false
      });
    }, 3000);
  }, 4000);
  
}, 3000);

// Keep the client running for testing
console.log('🔄 Socket client running... Press Ctrl+C to exit');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Disconnecting...');
  socket.disconnect();
  process.exit(0);
});
