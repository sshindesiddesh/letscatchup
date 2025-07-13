import React, { useEffect, useState } from 'react';
import { socketService } from '../services/socketService';
import { apiService } from '../services/apiService';

export function DebugTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(message);
  };

  const testCreateSession = async () => {
    try {
      addLog('🔄 Creating session...');
      const response = await apiService.createSession({
        description: 'Debug test session',
        creatorName: 'Debug User'
      });
      setSessionId(response.sessionId);
      setUserId(response.userId);
      addLog(`✅ Session created: ${response.sessionId}, User: ${response.userId}`);
    } catch (error) {
      addLog(`❌ Session creation failed: ${error}`);
    }
  };

  const testSocketConnection = () => {
    addLog('🔌 Testing Socket.io connection...');
    socketService.connect();
    
    setTimeout(() => {
      const connected = socketService.isConnected();
      addLog(`🔍 Socket connected: ${connected}`);
      
      if (connected && sessionId && userId) {
        addLog('👋 Joining session...');
        socketService.joinSession(sessionId, userId);
      }
    }, 2000);
  };

  const testAddKeyword = async () => {
    if (!sessionId || !userId) {
      addLog('❌ No session or user ID');
      return;
    }

    try {
      addLog('💡 Adding keyword...');
      await apiService.addKeyword(sessionId, {
        userId,
        text: 'test keyword',
        category: 'activity'
      });
      addLog('✅ Keyword added via API');
    } catch (error) {
      addLog(`❌ Keyword addition failed: ${error}`);
    }
  };

  // Listen for Socket.io events
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('💡') || message.includes('🔌') || message.includes('👋') || message.includes('🔍')) {
        setLogs(prev => [...prev, `CONSOLE: ${message}`]);
      }
      originalLog(...args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Real-Time Debug Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testCreateSession} style={{ marginRight: '10px' }}>
          1. Create Session
        </button>
        <button onClick={testSocketConnection} style={{ marginRight: '10px' }}>
          2. Connect Socket
        </button>
        <button onClick={testAddKeyword}>
          3. Add Keyword
        </button>
      </div>

      <div>
        <strong>Session ID:</strong> {sessionId}<br/>
        <strong>User ID:</strong> {userId}
      </div>

      <div style={{ 
        marginTop: '20px', 
        height: '400px', 
        overflow: 'auto', 
        border: '1px solid #ccc', 
        padding: '10px',
        backgroundColor: '#f5f5f5'
      }}>
        <h3>Debug Logs:</h3>
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
