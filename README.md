# Team Chat Application (Slack-like)

A full-stack team chat application built with Next.js, Tailwind CSS, and Express.js with Socket.io for real-time messaging.

## Features

- ✅ User Authentication (Register/Login)
- ✅ Real-time messaging with Socket.io
- ✅ Channels (Create and Join)
- ✅ Online/Offline user status
- ✅ Message history with pagination
- ✅ Modern UI with Tailwind CSS
- ✅ Responsive design
- ✅ **Leave Channel** - Users can exit channels
- ✅ **Online Users List** - See who's currently online
- ✅ **User Profiles** - View user details (join date, last seen)
- ✅ **Message Editing** - Edit your own messages in real-time
- ✅ **Message Deletion** - Delete your own messages
- ✅ **Search Functionality** - Search channels and users
- ✅ **Typing Indicators** - See who's typing
- ✅ **Channel Notifications** - Know when users join/leave

## Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Socket.io Client
- Axios

### Backend
- Node.js
- Express.js
- Socket.io
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Internship
```

2. **Backend Setup**

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/teamchat
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

3. **Frontend Setup**

Open a new terminal:
```bash
cd frontend
npm install
```

Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
Internship/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Channel.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── channels.js
│   │   ├── messages.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   └── ChatInterface.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── socket.ts
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── index.tsx
│   │   └── chat.tsx
│   ├── styles/
│   │   └── globals.css
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Channels
- `GET /api/channels` - Get all channels
- `POST /api/channels` - Create a new channel
- `GET /api/channels/:id` - Get a single channel
- `POST /api/channels/:id/join` - Join a channel
- `GET /api/channels/:id/messages` - Get messages for a channel

### Messages
- `POST /api/messages` - Create a new message
- `PUT /api/messages/:id` - Update a message
- `DELETE /api/messages/:id` - Delete a message

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a single user

## Socket.io Events

### Client to Server
- `join-channel` - Join a channel room
- `leave-channel` - Leave a channel room
- `send-message` - Send a new message
- `typing` - User is typing
- `stop-typing` - User stopped typing

### Server to Client
- `new-message` - New message received
- `user-online` - User came online
- `user-offline` - User went offline
- `user-typing` - User is typing
- `user-stop-typing` - User stopped typing

## Usage

1. Start MongoDB (if using local installation)
2. Start the backend server
3. Start the frontend server
4. Open `http://localhost:3000` in your browser
5. Register a new account or login
6. Create or join channels
7. Start chatting!

## Development

### Backend
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend
```bash
cd frontend
npm run dev  # Next.js development server
```

## Deployment

### Backend Deployment
- Deploy to Heroku, Railway, or any Node.js hosting service
- Update MongoDB connection string in production
- Set environment variables

### Frontend Deployment
- Deploy to Vercel (recommended for Next.js), Netlify, or any static hosting
- Update `NEXT_PUBLIC_API_URL` to your backend URL

## License

MIT

## Notes

- Make sure MongoDB is running before starting the backend
- For production, use a strong JWT_SECRET
- The application uses JWT tokens stored in cookies
- Socket.io connection requires authentication token

