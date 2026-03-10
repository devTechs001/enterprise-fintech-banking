# Enterprise FinTech/Banking Dashboard

Secure banking and financial management platform with enterprise-grade security.

## Features
- 💰 Account Management
- 💳 Card Management
- 📊 Transaction History & Analytics
- 💸 Money Transfers (Internal & External)
- 📈 Investment Portfolio Tracking
- 🏦 Loan Management
- 📱 Bill Payments
- 🔐 Two-Factor Authentication (2FA)
- 🔔 Real-time Transaction Alerts
- 📄 Statement Generation (PDF)
- 🌍 Multi-currency Support
- 🎯 Budget Planning
- 📊 Financial Reports
- 🤖 AI-powered Fraud Detection
- 🔒 Biometric Authentication Ready

## Tech Stack

### Frontend
- React 18+ (Vite)
- Redux Toolkit
- React Query
- Chart.js / Recharts
- Axios
- Material-UI
- Formik + Yup
- react-pdf (statements)
- Crypto-js (client-side encryption)

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT + Refresh Tokens
- bcryptjs (password hashing)
- speakeasy (2FA)
- qrcode (2FA QR codes)
- nodemailer (email alerts)
- winston (audit logging)
- helmet (security headers)
- express-rate-limit
- express-validator
- PDFKit (statement generation)

## Security Features
- End-to-end encryption
- PCI DSS compliance ready
- 2FA (TOTP)
- Session management
- IP whitelisting
- Rate limiting
- Audit logging
- XSS protection
- CSRF protection
- SQL injection prevention

## Quick Start

```bash
# Client
cd client
npm install
npm run dev

# Server
cd ../server
npm install
cp .env.example .env
npm run dev
```

## Compliance
- GDPR ready
- PCI DSS guidelines
- SOC 2 ready
- Audit trails

## License
MIT
