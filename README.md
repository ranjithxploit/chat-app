# Chat App

A full-stack real-time chat application built with React, TypeScript, Express.js, and Socket.IO.

## Project Structure

```
chat-app/
├── frontend/          # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── admin/        # Admin panel components
│   │   │   ├── Chat.tsx      # Main chat component
│   │   │   └── Navigation.tsx # Navigation component
│   │   ├── pages/
│   │   │   ├── Index.tsx     # Home/Chat page
│   │   │   └── NotFound.tsx  # 404 page
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── ...
├── backend/           # Express.js + Socket.IO backend
│   ├── server.js      # Main server file
│   ├── package.json
│   ├── .env           # Environment variables
│   └── README.md
├── package.json       # Root package.json with scripts
└── README.md         # This file
```

## Features

### Frontend
- ✅ React 18 with TypeScript
- ✅ Vite for fast development
- ✅ Tailwind CSS for styling
- ✅ shadcn/ui component library
- ✅ React Router for navigation
- ✅ React Query for state management
- ✅ Real-time chat interface
- ✅ Admin panel with user management
- ✅ Responsive design

### Backend
- ✅ Express.js server
- ✅ Socket.IO for real-time communication
- ✅ CORS enabled
- ✅ RESTful API endpoints
- ✅ Environment configuration

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   npm install
   ```

### Running the Application

#### Option 1: Run both frontend and backend separately

1. Start the backend server:
   ```bash
   npm run start:backend
   ```
   The backend will run on http://localhost:3001

2. In another terminal, start the frontend:
   ```bash
   npm run start:frontend
   ```
   The frontend will run on http://localhost:8080

#### Option 2: Run frontend only (for development)

```bash
npm start
```
This runs the frontend development server.

### Building for Production

Build the frontend for production:
```bash
npm run build:frontend
```

## API Endpoints

### Backend API (http://localhost:3001)

- `GET /api/health` - Health check endpoint
- `GET /api/users` - Get all users
- `GET /api/messages` - Get all messages

### Socket.IO Events

- `connection` - User connects
- `join_room` - User joins a chat room
- `send_message` - Send a message
- `receive_message` - Receive a message
- `disconnect` - User disconnects

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **React Router** - Client-side routing
- **React Query** - Data fetching and state management
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
npm run dev
```

### Available Scripts

From the root directory:
- `npm start` - Start frontend development server
- `npm run start:frontend` - Start frontend with dependencies install
- `npm run start:backend` - Start backend with dependencies install
- `npm run build:frontend` - Build frontend for production

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=3001
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.