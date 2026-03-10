# Enterprise Fintech Banking Application

A comprehensive enterprise-level fintech banking application built with React, Node.js, and PostgreSQL.

## Features

- **Authentication & Authorization**: Secure login, registration, MFA, and role-based access control
- **Account Management**: Multiple account types (checking, savings, investment, credit)
- **Transactions**: Real-time transaction tracking, transfers, and payments
- **Cards**: Virtual and physical card management
- **Analytics**: Spending analytics, budget tracking, and financial insights
- **Security**: Bank-grade security with encryption, audit logging, and fraud detection

## Tech Stack

### Client
- React 18 with Vite
- TailwindCSS for styling
- Redux Toolkit for state management
- React Query for server state
- Framer Motion for animations
- React Router for navigation

### Server
- Node.js with Express
- PostgreSQL with Sequelize ORM
- Redis for caching
- JWT for authentication
- Bull for job queues
- Socket.io for real-time updates

### Infrastructure
- Docker & Docker Compose
- GitHub Actions for CI/CD
- ESLint & Prettier for code quality

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/enterprise-fintech-banking.git
cd enterprise-fintech-banking
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment files:
```bash
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env
```

4. Update environment variables with your credentials.

5. Start the application:

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Local Development**
```bash
# Start both client and server
npm run dev

# Or start individually
npm run dev:client
npm run dev:server
```

## Project Structure

```
enterprise-fintech-banking/
├── client/          # React frontend
├── server/          # Node.js backend
├── shared/          # Shared code (constants, types, utils)
├── docker/          # Docker configurations
├── docs/            # Documentation
├── scripts/         # Utility scripts
└── .github/         # GitHub workflows
```

## Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code
- `docker-compose up` - Start with Docker

## Documentation

- [API Documentation](docs/api/swagger.yaml)
- [Architecture](docs/architecture/system-design.md)
- [Deployment Guide](docs/deployment/deployment-guide.md)
- [Security Policy](docs/security/security-policy.md)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

For support, email support@securebank.com or open an issue in the repository.
