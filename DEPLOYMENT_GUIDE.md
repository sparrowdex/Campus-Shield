# Campus Shield Deployment Guide

## 🚀 Backend Deployment (Render Recommended)

### Prerequisites
- GitHub account
- Render account (free at [render.com](https://render.com))

### Step 1: Prepare Your Repository
1. Make sure your code is pushed to GitHub
2. Verify your `server/package.json` has the correct scripts

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New Web Service" and connect your GitHub repo
3. Set the root directory to `server`
4. Set build command to `npm install` and start command to `node index.js`
5. Add environment variables as needed

### Step 3: Set Up MongoDB Database
1. Use MongoDB Atlas (see below) or Render's managed database
2. Copy the MongoDB connection string

### Step 4: Configure Environment Variables
Add these to your Render service:

```env
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://your-frontend-domain.vercel.app
MONGODB_URI=your-mongodb-atlas-connection-string
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
1. Render will automatically deploy when you push to GitHub
2. Check the deployment logs in Render dashboard
3. Test your API endpoints using the provided URL
4. Health check: `https://your-app.onrender.com/health`

### Step 6: Get Your Backend URL
- Render will provide a URL like: `https://your-app-name.onrender.com`
- Save this URL for your frontend deployment

## 🔧 Troubleshooting

### Common Issues:
1. **Build fails**: Check Render logs for missing dependencies
2. **Database connection fails**: Verify MongoDB URI in environment variables
3. **CORS errors**: Update CORS_ORIGIN to match your frontend domain
4. **Port issues**: Render automatically sets PORT environment variable

### Useful Commands:
- View Render logs in the dashboard

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