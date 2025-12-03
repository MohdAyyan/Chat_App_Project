# Setup Instructions

## Quick Start Guide

Follow these steps to get the Team Chat Application running on your local machine.

### Step 1: Install MongoDB

If you don't have MongoDB installed:

**Option A: Local Installation**
- Download and install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
- Start MongoDB service on your machine

**Option B: MongoDB Atlas (Cloud)**
- Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# For Windows PowerShell:
Copy-Item .env.example .env

# For Linux/Mac:
# cp .env.example .env

# Edit .env file and update:
# - MONGODB_URI (use your MongoDB connection string)
# - JWT_SECRET (use a strong random string)

# Start the backend server
npm run dev
```

The backend should now be running on `http://localhost:5000`

### Step 3: Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file
# For Windows PowerShell:
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# For Linux/Mac:
# echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Start the frontend development server
npm run dev
```

The frontend should now be running on `http://localhost:3000`

### Step 4: Access the Application

1. Open your browser and go to `http://localhost:3000`
2. Register a new account
3. Create or join channels
4. Start chatting!

## Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/teamchat
JWT_SECRET=your_very_secure_random_secret_key_here
NODE_ENV=development
```

**Important Notes:**
- Replace `MONGODB_URI` with your actual MongoDB connection string
- For MongoDB Atlas, use: `mongodb+srv://username:password@cluster.mongodb.net/teamchat?retryWrites=true&w=majority`
- Generate a strong `JWT_SECRET` (you can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Change this if your backend is running on a different port or URL.

## Troubleshooting

### MongoDB Connection Issues

1. **Make sure MongoDB is running:**
   - Windows: Check Services for MongoDB
   - Mac/Linux: `sudo systemctl status mongod` or `brew services list`

2. **Check connection string:**
   - Verify your MongoDB URI is correct
   - For Atlas, ensure your IP is whitelisted

### Port Already in Use

If port 5000 or 3000 is already in use:

1. **Backend:** Change `PORT` in backend/.env
2. **Frontend:** Update `NEXT_PUBLIC_API_URL` in frontend/.env.local to match

### Socket.io Connection Issues

- Ensure backend is running before frontend
- Check CORS settings in backend/server.js
- Verify `NEXT_PUBLIC_API_URL` matches your backend URL

## Production Deployment

### Backend

1. Deploy to Heroku, Railway, or similar
2. Set environment variables in hosting platform
3. Update MongoDB URI for production database

### Frontend

1. Deploy to Vercel (recommended) or Netlify
2. Set `NEXT_PUBLIC_API_URL` environment variable to your backend URL
3. Build and deploy

## Need Help?

Check the main README.md for more details about the project structure and API endpoints.

