# Team Chat Application - Backend

This is the backend server for the Team Chat Application, built with Node.js, Express, and Socket.IO. It provides real-time messaging, user authentication, and channel management features.

## Features

- 🔐 User authentication (Register/Login with JWT)
- 💬 Real-time messaging using Socket.IO
- 📁 Channel management (Create, Join, List channels)
- 👥 User management
- 🔄 Real-time notifications

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- MongoDB database

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MohdAyyan/Chat_Backend.git
   cd Chat_Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/me` - Get current user profile

### Channels
- `GET /api/channels` - Get all channels
- `POST /api/channels` - Create a new channel
- `GET /api/channels/:id` - Get channel details

### Messages
- `GET /api/messages/:channelId` - Get messages for a channel
- `POST /api/messages` - Send a new message

## Deployment

### Railway
This project is configured to be deployed on Railway. Follow these steps:

1. Create a new Railway project
2. Connect your GitHub repository
3. Add environment variables
4. Deploy

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Port to run the server | No (default: 5000) |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret key for JWT | Yes |
| NODE_ENV | Environment (development/production) | No |

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
