# 🚀 Render Deployment Guide for NRG DataSense Platform

This guide will help you deploy the NRG DataSense platform on Render with full database persistence for user configurations.

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **NRG API Credentials**: Client ID and Client Secret from NRG Systems

## 🏗️ Architecture Overview

The deployment consists of three components:

1. **Backend API** (Python Flask) - Handles RLD conversion and configuration storage
2. **Frontend** (React Static Site) - User interface
3. **Database** (PostgreSQL) - Stores user configurations persistently

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. Ensure your repository has the following structure:
   ```
   ├── backend/
   │   ├── app.py
   │   ├── requirements.txt
   │   ├── config.py
   │   └── run.py
   ├── src/
   │   ├── App.js
   │   └── services/
   │       └── api.js
   ├── package.json
   ├── render.yaml
   └── README.md
   ```

2. Make sure all files are committed and pushed to GitHub.

### Step 2: Deploy on Render

#### Option A: Using render.yaml (Recommended)

1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing your code

2. **Deploy**:
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to deploy all services
   - This will create:
     - Backend API service
     - Frontend static site
     - PostgreSQL database

#### Option B: Manual Deployment

If you prefer to deploy services individually:

##### 1. Create Database
- Go to "New +" → "PostgreSQL"
- Name: `nrg-datasense-db`
- Plan: Starter (Free)
- Region: Choose closest to your users
- Click "Create Database"

##### 2. Deploy Backend
- Go to "New +" → "Web Service"
- Connect your GitHub repository
- Configure:
  - **Name**: `nrg-datasense-backend`
  - **Environment**: Python
  - **Build Command**: `cd backend && pip install -r requirements.txt`
  - **Start Command**: `cd backend && python run.py`
  - **Environment Variables**:
    - `DATABASE_URL`: Copy from your PostgreSQL database
    - `FLASK_ENV`: `production`
    - `NRG_CLIENT_ID`: Your NRG Client ID
    - `NRG_CLIENT_SECRET`: Your NRG Client Secret

##### 3. Deploy Frontend
- Go to "New +" → "Static Site"
- Connect your GitHub repository
- Configure:
  - **Name**: `nrg-datasense-frontend`
  - **Build Command**: `npm install && npm run build`
  - **Publish Directory**: `build`
  - **Environment Variables**:
    - `REACT_APP_API_URL`: Your backend URL (e.g., `https://nrg-datasense-backend.onrender.com`)

## 🔧 Configuration

### Environment Variables

#### Backend Environment Variables:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
FLASK_ENV=production
NRG_CLIENT_ID=your_nrg_client_id
NRG_CLIENT_SECRET=your_nrg_client_secret
```

#### Frontend Environment Variables:
```bash
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### Database Setup

The database will be automatically created with the following tables:
- `user_config`: Stores user configurations and settings

## 🔍 Testing Your Deployment

1. **Backend Health Check**:
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```

2. **Frontend Access**:
   - Visit your frontend URL
   - Check if the application loads correctly
   - Test the settings panel

3. **Configuration Persistence**:
   - Open settings and configure NRG API credentials
   - Save settings
   - Close browser and reopen
   - Verify settings are still there

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data like API keys
2. **Database Access**: Render automatically secures database connections
3. **CORS**: Backend is configured to allow frontend domain
4. **File Upload Limits**: Set to 100MB max file size

## 📊 Monitoring

### Render Dashboard
- Monitor service health in Render dashboard
- Check logs for any errors
- Monitor database usage

### Application Logs
- Backend logs are available in Render dashboard
- Frontend errors appear in browser console

## 🚨 Troubleshooting

### Common Issues:

1. **Backend Not Starting**:
   - Check if all dependencies are in `requirements.txt`
   - Verify environment variables are set correctly
   - Check logs for Python errors

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is correct
   - Check if database is running
   - Ensure database credentials are valid

3. **Frontend Not Loading**:
   - Check if `REACT_APP_API_URL` points to correct backend
   - Verify build completed successfully
   - Check browser console for errors

4. **Configuration Not Saving**:
   - Check if database is accessible
   - Verify backend API endpoints are working
   - Check browser network tab for API errors

### Debug Commands:

```bash
# Check backend health
curl https://your-backend-url.onrender.com/health

# Check database connection
curl https://your-backend-url.onrender.com/api/config?session_id=test

# Test file conversion (if you have RLD files)
curl -X POST -F "files=@test.rld" https://your-backend-url.onrender.com/convert-rld
```

## 🔄 Updates and Maintenance

### Updating the Application:
1. Push changes to GitHub
2. Render will automatically redeploy
3. Monitor deployment logs
4. Test functionality after deployment

### Database Migrations:
- Database schema changes are handled automatically
- New tables/columns are created on startup
- No manual migration needed

## 💰 Cost Considerations

### Free Tier Limits:
- **Backend**: 750 hours/month (free tier)
- **Frontend**: Unlimited (static sites are free)
- **Database**: 1GB storage (free tier)

### Paid Plans:
- **Backend**: $7/month for always-on service
- **Database**: $7/month for 1GB storage
- **Frontend**: Remains free

## 📞 Support

If you encounter issues:
1. Check Render documentation
2. Review application logs
3. Test locally first
4. Contact Render support if needed

---

**🎉 Congratulations!** Your NRG DataSense platform is now deployed with full database persistence. Users can close their browsers and reopen them, and their configurations will be preserved across sessions and devices. 