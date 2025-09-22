# Chat App Backend

A simple Express.js backend with Socket.IO for real-time chat functionality.

## Features

- RESTful API endpoints
- Real-time messaging with Socket.IO
- CORS enabled for frontend integration
- Health check endpoint

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/users` - Get all users
- `GET /api/messages` - Get all messages

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. For development with auto-reload:
   ```bash
   npm run dev
   ```

The server will run on port 3001 by default.