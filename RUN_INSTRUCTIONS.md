# Enterprise Fintech Banking Application

A comprehensive enterprise-grade fintech banking platform with React frontend and Node.js backend.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ and npm v9+
- PostgreSQL 14+
- Redis 7+

### Installation

#### 1. Install Client Dependencies
```bash
cd client
npm install
```

#### 2. Install Server Dependencies
```bash
cd server
npm install
```

#### 3. Install Root Dependencies (optional - for monorepo management)
```bash
cd ..
npm install
```

### Environment Setup

#### Client (.env)
Create `client/.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=SecureBank
VITE_APP_VERSION=1.0.0
```

#### Server (.env)
Create `server/.env` file:
```env
# Server
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fintech_db
DB_NAME=fintech_db
DB_USER=user
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRATION_MINUTES=15
JWT_REFRESH_EXPIRATION_DAYS=7

# Email (SendGrid)
EMAIL_PROVIDER=sendgrid
EMAIL_FROM=noreply@securebank.com
SENDGRID_API_KEY=your-sendgrid-api-key

# SMS (Twilio)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Storage (AWS S3)
STORAGE_PROVIDER=aws-s3
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# CORS
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json
```

### Running the Application

#### Option 1: Run Separately (Recommended for Development)

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```
Server will start on http://localhost:3000

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```
Client will start on http://localhost:5173

#### Option 2: Run with Docker (Production)
```bash
docker-compose up -d
```

#### Option 3: Run Both with Makefile
```bash
make dev
```

### Database Setup

#### 1. Create Database
```bash
psql -U postgres
CREATE DATABASE fintech_db;
\q
```

#### 2. Run Migrations
```bash
cd server
npm run migrate
```

#### 3. Seed Database (Optional)
```bash
npm run seed
```

## 📁 Project Structure

```
enterprise-fintech-banking/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Redux store
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Global styles
│   └── package.json
│
├── server/                # Node.js + Express backend
│   ├── src/
│   │   ├── api/          # API routes and controllers
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── utils/        # Utility functions
│   │   └── config/       # Configuration
│   └── package.json
│
├── shared/               # Shared code between client and server
│   ├── constants/
│   ├── types/
│   ├── utils/
│   └── validations/
│
└── docker/              # Docker configurations
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Redux Toolkit** for state management
- **React Query** for server state
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **React Router v6** for routing
- **Formik + Yup** for forms
- **Axios** for HTTP requests

### Backend
- **Node.js** with Express
- **Sequelize** ORM with PostgreSQL
- **Redis** for caching
- **JWT** for authentication
- **Winston** for logging
- **Socket.io** for real-time features
- **Stripe/PayPal** for payments

## 📋 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `GET /api/v1/auth/me` - Get current user

### Accounts
- `GET /api/v1/accounts` - Get all accounts
- `GET /api/v1/accounts/:id` - Get account by ID
- `POST /api/v1/accounts` - Create new account
- `PATCH /api/v1/accounts/:id` - Update account
- `DELETE /api/v1/accounts/:id` - Close account

### Transactions
- `GET /api/v1/transactions` - Get transactions
- `POST /api/v1/transactions` - Create transaction
- `GET /api/v1/transactions/:id` - Get transaction details

## 🧪 Testing

### Client Tests
```bash
cd client
npm test
npm run test:coverage
```

### Server Tests
```bash
cd server
npm test
```

## 📦 Build for Production

### Client
```bash
cd client
npm run build
```

### Server
```bash
cd server
npm run build
```

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- XSS protection
- SQL injection prevention
- Input validation with express-validator
- Audit logging

## 📄 License

MIT

## 👥 Contributors

- Development Team

## 📞 Support

For support, email support@securebank.com or open an issue in the repository.
