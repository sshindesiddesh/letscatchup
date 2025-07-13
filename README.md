# 🤝 letscatchup.ai

A collaborative meeting planner for 2-20 friends that uses natural language input and real-time visual preference matching to simplify group meetup planning.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- No other dependencies needed!

### Run the Application

1. **Clone and start the application:**
   ```bash
   git clone <your-repo>
   cd letscatchup
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Ollama LLM: http://localhost:11434

3. **Test multi-user functionality:**
   - Open multiple browser tabs/windows
   - Create a meetup in one tab
   - Join with the shareable link in other tabs
   - Watch real-time collaboration in action!

## 🏗️ Project Structure

```
letscatchup/
├── frontend/           # React + TypeScript + Tailwind CSS
├── backend/            # Node.js + Express + Socket.io
├── docker-compose.yml  # Development environment
└── README.md          # This file
```

## 🎯 Features

### Stage 1: Creator Interface
- Simple landing page with natural language input
- LLM processing to extract initial categories
- Shareable link generation

### Stage 2: Friend Onboarding
- Personalized question flow (max 3-4 questions)
- Adaptive questions based on creator's input
- Multiple choice answers

### Stage 3: Live Collaborative Arena
- Real-time visual preference matching
- Circle-based voting system with color coding
- Automatic consensus detection
- Mobile-optimized touch interactions

## 🛠️ Development

### Local Development (without Docker)
```bash
# Install dependencies
npm run install:all

# Run frontend and backend separately
npm run dev:frontend  # Port 3000
npm run dev:backend   # Port 3001
```

### Testing
```bash
npm test
```

## 📱 Mobile Support
- Mobile-first responsive design
- Touch interactions (tap, long press, swipe)
- Optimized for 2-20 concurrent users

## 🧠 LLM Integration
- Local Ollama with Llama 3.2 (3B parameters)
- Natural language processing for meetup descriptions
- Intelligent keyword categorization
- No external API keys required

## 🎨 Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, Socket.io
- **Storage:** In-memory (perfect for MVP/demo)
- **LLM:** Ollama with Llama 3.2
- **Development:** Docker Compose
