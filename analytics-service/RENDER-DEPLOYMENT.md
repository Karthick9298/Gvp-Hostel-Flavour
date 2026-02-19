# Analytics Service - Render Deployment Guide

## Critical: Environment Variables Configuration

Your analytics service on Render **MUST** have the following environment variables configured in the Render dashboard. Without these, the service will fail to connect to MongoDB and return errors.

### Required Environment Variables

Go to your Render dashboard → Select "gvp-hostel-flavour" (analytics service) → Environment tab → Add the following:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `PORT` | `8000` | Port for the service (Render auto-assigns, but good to set) |
| `HOST` | `0.0.0.0` | Listen on all interfaces |
| `ENVIRONMENT` | `production` | Set to production mode |
| `MONGODB_URI` | `mongodb+srv://karthikeya9298_db_user:9HHFy76SUPOQPzIF@hostelfoodcluster.j39w584.mongodb.net/hostel-food-analysis?appName=HostelFoodCluster` | **CRITICAL** - MongoDB connection string |
| `CORS_ORIGINS` | `https://gvp-hostel-flavour-1.onrender.com,https://gvp-hostel-flavour.vercel.app` | Allowed origins for CORS |

### Steps to Add Environment Variables on Render:

1. **Login to Render** (https://dashboard.render.com)

2. **Navigate to your Analytics Service**
   - Click on "gvp-hostel-flavour" (your analytics service)

3. **Go to Environment Tab**
   - Click on "Environment" in the left sidebar

4. **Add Each Variable**
   - Click "Add Environment Variable"
   - Enter the Key and Value from the table above
   - Click "Save Changes"

5. **Deploy**
   - After adding all variables, click "Manual Deploy" → "Deploy latest commit"
   - Or wait for auto-deploy if you have auto-deploy enabled

### Why This is Necessary

The analytics service was previously trying to load environment variables from `backend/.env`, which doesn't exist in the Render deployment. Each Render service is isolated and needs its own environment configuration.

### Verification Steps

After deploying with the environment variables:

1. **Check Health Endpoint**
   ```bash
   curl https://gvp-hostel-flavour.onrender.com/health
   ```
   Should return:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "timestamp": "...",
     "environment": "production"
   }
   ```

2. **Check Logs**
   - Go to Render dashboard → Your service → Logs
   - Look for "Database connected successfully" messages
   - Check for any MongoDB connection errors

3. **Test Analytics Endpoint**
   ```bash
   curl "https://gvp-hostel-flavour.onrender.com/api/analytics/daily/2026-02-18?include_charts=true"
   ```
   Should return analytics data (may take 10-30 seconds for chart generation)

### Troubleshooting

#### If you see "Analytics service error" in backend logs:

1. **Check Render Logs** for the analytics service
   - Look for "Database connection failed" or similar errors
   - Verify MongoDB URI is correctly set

2. **Verify Environment Variables**
   - Ensure all variables are set in Render dashboard
   - Check for typos in variable names

3. **Check Service Status**
   - Ensure the service is running (not in "Suspended" state)
   - Render free tier services spin down after inactivity

#### If timeout errors occur:

- The analytics service may take 30-60 seconds to process requests with charts
- Backend has a 100-second timeout configured
- Render free tier has limited resources - consider upgrading if timeouts persist

### Important Notes

⚠️ **Never commit `.env` files to Git** - They contain sensitive credentials

✅ **Always configure environment variables in Render dashboard** for production

✅ **Test after each deployment** to ensure everything works

## Current Service URLs

- **Backend**: https://gvp-hostel-flavour-1.onrender.com/api
- **Analytics Service**: https://gvp-hostel-flavour.onrender.com
- **Frontend**: https://gvp-hostel-flavour.vercel.app

## Next Steps After Configuration

1. Add all environment variables to Render
2. Deploy the analytics service
3. Test the health endpoint
4. Test from your backend by accessing the admin dashboard
5. Monitor logs for any errors
