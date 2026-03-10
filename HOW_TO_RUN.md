# 🚀 How to Run the Enterprise Fintech Banking Application

## Quick Start (Copy & Paste Commands)

### Step 1: Clone and Install

```bash
# Navigate to the project
cd /home/darkhat/projects/react-projects/enterprise-fintech-banking

# Install client dependencies
cd client
npm install

# Install server dependencies  
cd ../server
npm install
```

### Step 2: Create Environment Files

**Client (.env):**
```bash
cd client
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:3000/api/v1
EOF
```

**Server (.env):**
```bash
cd server
cat > .env << EOF
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/fintech_test
JWT_ACCESS_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
REDIS_HOST=localhost
REDIS_PORT=6379
EOF
```

### Step 3: Run the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```

Server will start on: **http://localhost:3000**

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```

Client will start on: **http://localhost:5173**

---

## 📦 What You Get

### Frontend (React + Vite)
- ✅ Dashboard with account cards
- ✅ Virtual card with 3D flip animation
- ✅ Transaction lists
- ✅ Complete UI component library
- ✅ Redux state management
- ✅ React Query for data fetching

### Backend (Node.js + Express)
- ✅ RESTful API
- ✅ JWT Authentication
- ✅ PostgreSQL with Sequelize ORM
- ✅ Redis caching
- ✅ Error handling
- ✅ Request logging

---

## 🧪 Test the API

Once the server is running, test these endpoints:

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api

# Register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Missing Dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Error
Make sure PostgreSQL is running:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

---

## 📁 Project Repository

**GitHub:** https://github.com/devTechs001/enterprise-fintech-banking

---

## 📋 Available Scripts

### Client
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm test         # Run tests
```

### Server
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm test         # Run tests
npm run lint     # Run ESLint
```

---

## ✅ Verification Checklist

After running, verify:
- [ ] Server starts on http://localhost:3000
- [ ] Client starts on http://localhost:5173
- [ ] Health endpoint responds: http://localhost:3000/health
- [ ] No console errors in browser
- [ ] Can access the landing page

---

## 🎯 Next Steps

1. Set up PostgreSQL database
2. Run database migrations
3. Configure Redis
4. Add payment gateway credentials
5. Set up email service (SendGrid)
6. Configure SMS service (Twilio)

For production deployment, see `RUN_INSTRUCTIONS.md`
