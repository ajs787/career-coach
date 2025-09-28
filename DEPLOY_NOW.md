# 🚀 Deploy Career Reality Coach Now!

Your app is ready to deploy! Here are the quick steps:

## Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub** (if not already done):
   ```bash
   git remote add origin https://github.com/yourusername/career-reality-coach.git
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in

3. **Click "New Project"** and import your GitHub repository

4. **Vercel will auto-detect Next.js** - just click "Deploy"

5. **Set Environment Variables** in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add these variables:

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

6. **Set up Database** (Supabase recommended):
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy connection string to `DATABASE_URL`
   - Run migrations: `npx prisma migrate deploy`
   - Seed data: `npx tsx prisma/seed.ts`

## Option 2: Deploy via Vercel CLI

1. **Login to Vercel**:
   ```bash
   npx vercel login
   ```

2. **Deploy**:
   ```bash
   npx vercel --prod
   ```

3. **Set environment variables** in Vercel dashboard

## Option 3: Deploy to Other Platforms

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

- [ ] App loads successfully
- [ ] Database connection works
- [ ] Authentication works (Google OAuth or Magic Link)
- [ ] Admin panel accessible at `/admin`
- [ ] All pages load without errors
- [ ] API routes respond correctly

## Quick Test

Once deployed, test these URLs:
- `/` - Landing page
- `/intake` - Intake wizard
- `/admin` - Admin panel (use admin@example.com)
- `/auth/signin` - Sign in page

## Need Help?

- Check Vercel deployment logs
- Verify environment variables are set
- Ensure database is accessible
- Check Next.js build logs

## Your App is Ready! 🎉

The Career Reality Coach app is fully functional with:
- ✅ Adaptive question generation
- ✅ Multi-bucket scoring system
- ✅ US-specific career data
- ✅ Admin panel
- ✅ Authentication
- ✅ Responsive design
- ✅ Production-ready build

Just add your database and deploy!
