# Deployment Guide - Career Reality Coach

## Quick Deploy to Vercel

### 1. Prerequisites
- GitHub account
- Vercel account (free tier available)
- PostgreSQL database (Supabase recommended)

### 2. Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings > Database and copy your connection string
3. It should look like: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

### 3. Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/career-reality-coach.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Set Environment Variables**
   In Vercel dashboard, go to Settings > Environment Variables and add:

   ```
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   NEXTAUTH_SECRET=your-random-secret-key-here
   NEXTAUTH_URL=https://your-app.vercel.app
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=your-app-password
   EMAIL_FROM=noreply@yourdomain.com
   APP_URL=https://your-app.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### 4. Database Migration

After deployment, run the database migration:

1. Go to your Vercel project dashboard
2. Go to Functions tab
3. Create a new function to run the migration:

```bash
# In Vercel CLI or via function
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### 5. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
6. Copy Client ID and Secret to Vercel environment variables

### 6. Email Setup (Optional)

For magic link authentication:

1. Use Gmail SMTP or any email service
2. For Gmail, enable 2FA and create an App Password
3. Add email credentials to Vercel environment variables

## Alternative Deployment Options

### Railway
1. Connect GitHub repository
2. Add PostgreSQL database
3. Set environment variables
4. Deploy

### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables are set
- [ ] Authentication works (Google OAuth or Magic Link)
- [ ] Admin panel accessible at `/admin`
- [ ] Database seeded with initial data
- [ ] All API routes working
- [ ] SSL certificate active

## Troubleshooting

### Build Errors
- Check that all environment variables are set
- Ensure Prisma client is generated
- Verify database connection string

### Database Issues
- Check Supabase connection string
- Ensure database is accessible from Vercel
- Run migrations manually if needed

### Authentication Issues
- Verify OAuth redirect URIs
- Check NEXTAUTH_SECRET is set
- Ensure NEXTAUTH_URL matches your domain

## Monitoring

- Use Vercel Analytics for performance monitoring
- Set up error tracking with Sentry (optional)
- Monitor database usage in Supabase dashboard

## Scaling

- Upgrade Vercel plan for more bandwidth
- Use Supabase Pro for database scaling
- Add CDN for static assets
- Implement caching strategies
