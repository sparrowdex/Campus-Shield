# Campus Shield Deployment Guide

## 🚀 Railway Backend Deployment (Recommended First Step)

### Prerequisites
- GitHub account
- Railway account (free at [railway.app](https://railway.app))

### Step 1: Prepare Your Repository
1. Make sure your code is pushed to GitHub
2. Ensure you have the `railway.json` file in your root directory
3. Verify your `server/package.json` has the correct scripts

### Step 2: Deploy to Railway

#### Option A: Deploy via Railway Dashboard
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your Campus Shield repository
4. Choose the `server` directory as your source
5. Railway will automatically detect it's a Node.js app

#### Option B: Deploy via Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Step 3: Set Up MongoDB Database
1. In your Railway project dashboard, click "New"
2. Select "Database" → "MongoDB"
3. Railway will automatically create a MongoDB instance
4. Copy the MongoDB connection string from the "Connect" tab

### Step 4: Configure Environment Variables
In your Railway project dashboard, go to "Variables" and add:

```env
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.vercel.app
MONGODB_URI=your-railway-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads
BCRYPT_ROUNDS=12
LOG_LEVEL=info
USER_DATA_RETENTION_DAYS=365
REPORT_DATA_RETENTION_DAYS=730
```

### Step 5: Deploy and Test
1. Railway will automatically deploy when you push to GitHub
2. Check the deployment logs in Railway dashboard
3. Test your API endpoints using the provided URL
4. Health check: `https://your-app.railway.app/health`

### Step 6: Get Your Backend URL
- Railway will provide a URL like: `https://your-app-name.railway.app`
- Save this URL for your frontend deployment

## 🔧 Troubleshooting

### Common Issues:
1. **Build fails**: Check Railway logs for missing dependencies
2. **Database connection fails**: Verify MongoDB URI in environment variables
3. **CORS errors**: Update CORS_ORIGIN to match your frontend domain
4. **Port issues**: Railway automatically sets PORT environment variable

### Useful Commands:
```bash
# View Railway logs
railway logs

# Check deployment status
railway status

# Open Railway dashboard
railway open
```

## 📝 Next Steps
After successful backend deployment:
1. Deploy frontend to Vercel (see next section)
2. Update CORS_ORIGIN with your frontend URL
3. Test the complete application
4. Set up custom domain (optional)

## 🔒 Security Notes
- Change JWT_SECRET to a strong random string
- Use HTTPS in production
- Set up proper rate limiting
- Consider adding API key authentication for admin routes 