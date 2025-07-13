#!/bin/bash

echo "🚀 Testing letscatchup.ai setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Test backend health
echo "🔍 Testing backend health..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Test frontend
echo "🔍 Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

# Test Ollama
echo "🔍 Testing Ollama..."
if curl -f http://localhost:11434/api/version > /dev/null 2>&1; then
    echo "✅ Ollama is running"
else
    echo "⚠️  Ollama might still be downloading the model..."
fi

echo ""
echo "🎉 Setup test complete!"
echo ""
echo "📱 Access your app:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Ollama:   http://localhost:11434"
echo ""
echo "🛑 To stop: docker-compose down"
