# Eldohub LMS Backend - Deployment Guide

## Prerequisites
- Node.js 18+ LTS
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for file storage)
- Nodemailer-compatible email service
- Git

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd eldohub-lms-backend
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Environment Configuration
Create `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/eldohub-lms

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key_here_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Eldohub Academy
EMAIL_FROM_EMAIL=noreply@eldohub.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Generate Strong Secrets
```bash
# Generate JWT secrets (run in Node REPL or use openssl)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Run Development Server
```bash
npm run dev
# or
bun run dev
```

Server will start at `http://localhost:5000`

## Database Setup

### MongoDB Atlas Setup
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create database user
4. Whitelist IP address
5. Copy connection string to `MONGODB_URI`

### Local MongoDB
If using local MongoDB:
```bash
# Install MongoDB Community
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Linux
sudo apt-get install -y mongodb

# Start MongoDB
mongod

# In .env:
MONGODB_URI=mongodb://localhost:27017/eldohub-lms
```

## Email Setup

### Gmail
1. Enable 2FA on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `EMAIL_PASSWORD`

### Other Providers
Update `src/utils/emailService.js` with appropriate SMTP settings

## Cloudinary Setup
1. Sign up at https://cloudinary.com
2. Go to Dashboard → Settings
3. Copy Cloud Name, API Key, and API Secret
4. Add to `.env`

## Production Deployment

### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create eldohub-lms-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_production_uri
heroku config:set JWT_ACCESS_SECRET=your_secret_key
# ... set all env vars

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### AWS EC2
```bash
# Launch EC2 instance (Ubuntu 22.04)
# SSH into instance
ssh -i key.pem ubuntu@your-instance-ip

# Install Node
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone repo
git clone <repository-url>
cd eldohub-lms-backend

# Install dependencies
npm install

# Create .env file
nano .env

# Start with PM2
pm2 start src/server.js --name "eldohub-lms"
pm2 save
pm2 startup

# Install Nginx reverse proxy
sudo apt-get install -y nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/default
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src
COPY .env .

EXPOSE 5000

CMD ["node", "src/server.js"]
```

**Build and Run:**
```bash
docker build -t eldohub-lms-backend .
docker run -p 5000:5000 --env-file .env eldohub-lms-backend
```

### AWS ECS (Elastic Container Service)
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker tag eldohub-lms-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/eldohub-lms-backend:latest

docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/eldohub-lms-backend:latest

# Create ECS cluster and task definition
# ... (follow AWS documentation)
```

## SSL Certificate (HTTPS)

### Let's Encrypt with Certbot
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Database Backups

### MongoDB Atlas
1. Go to Backup section
2. Enable automatic backups
3. Download snapshots as needed

### Manual Backup
```bash
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/eldohub-lms" --out=./backup
```

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 logs --lines 1000 --err
```

### Sentry Integration
```bash
npm install @sentry/node

# Add to src/app.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,
});
```

## Performance Optimization

### 1. Enable Compression
```javascript
import compression from 'compression';
app.use(compression());
```

### 2. Database Indexes
Already configured in Mongoose schemas

### 3. Caching
Consider Redis for session and query caching

### 4. CDN
Use Cloudinary for media delivery (already integrated)

## Security Checklist

- [ ] Environment variables configured
- [ ] MongoDB credentials stored securely
- [ ] JWT secrets are strong (32+ chars)
- [ ] CORS configured with specific origin
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented (if needed)
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] SQL/NoSQL injection prevention
- [ ] CSRF protection

## Health Checks

```bash
# Basic health check
curl http://localhost:5000/api/health

# With token
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/auth/me
```

## Troubleshooting

### MongoDB Connection Error
```bash
# Check connection string format
# Ensure IP is whitelisted on MongoDB Atlas
# Verify credentials
```

### JWT Errors
```bash
# Regenerate secrets in .env
# Clear browser local storage
# Check token expiry time
```

### Email Not Sending
```bash
# Enable less secure apps for Gmail
# Check SMTP credentials
# Verify email configuration in emailService.js
```

### CORS Issues
```bash
# Update FRONTEND_URL in .env
# Ensure frontend URL matches exactly
```

## Scaling Considerations

1. **Load Balancing**: Use Nginx or AWS Load Balancer
2. **Database Replication**: Enable MongoDB replication
3. **Caching**: Implement Redis for sessions
4. **CDN**: Use Cloudinary for assets
5. **Microservices**: Split services if needed
6. **Message Queue**: Use for async tasks (email, notifications)

## CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: git push heroku main
```

## Support
For issues and questions, create an issue on GitHub or contact the development team.
