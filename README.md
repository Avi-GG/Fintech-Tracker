# 🚀 Fintech Expense Tracker

A comprehensive fintech application built with modern web technologies, featuring real-time transactions, cryptocurrency conversion, virtual cards, and analytics.

## ✨ Features

### 🔐 Authentication & Security

- JWT-based authentication with HTTP-only cookies
- Role-based access control (User)
- Secure password hashing with bcrypt
- Protected routes and middleware

### 💰 Wallet System

- Multi-currency wallet (USD/BTC)
- Real-time balance updates via WebSocket
- Deposit/withdraw functionality
- Transaction history tracking

### 🔄 Peer-to-Peer Transfers

- Instant money transfers between users
- Transaction status tracking (pending/completed/failed)
- Real-time notifications
- Transfer history and receipts

### 💱 Cryptocurrency Exchange

- Live BTC/USD conversion rates via CoinGecko API
- Real-time crypto price feed
- Conversion history tracking
- Automatic balance updates

### 💳 Virtual Cards

- Generate virtual debit cards
- Random 16-digit card numbers
- Secure CVV and expiry dates
- Card management interface

### 📊 Analytics Dashboard

- User statistics and analytics
- Transaction monitoring
- Top users by activity
- System-wide metrics

### 🔄 Real-time Features

- Live balance updates
- Real-time crypto prices
- Instant transaction notifications
- Socket.IO integration

## 🛠 Tech Stack

### Backend

- **Node.js** + **Express.js** - Server framework
- **PostgreSQL** - Primary database
- **Prisma ORM** - Database modeling and migrations
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Winston** - Logging
- **Swagger** - API documentation

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates

### DevOps & Tools

- **Docker** - Containerization
- **Docker Compose** - Multi-service orchestration
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Nodemon** - Development server

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fintech-expense-tracker
   ```

2. **Start the database**

   ```bash
   cd backend
   docker-compose up -d
   ```

3. **Install dependencies**

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   ```bash
   cd ../backend
   # Edit .env file with your database credentials
   ```

5. **Set up the database**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   npm run seed
   ```

6. **Start the servers**

   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev

   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api-docs

## 🎯 Demo Accounts

After running the seed script, you can use these accounts:

- **User**: alice@demo.com / password123
- **User**: bob@demo.com / password123

## 📝 API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Wallet

- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/deposit` - Deposit money
- `POST /api/wallet/withdraw` - Withdraw money
- `GET /api/wallet/transactions` - Get wallet transactions

### Transactions

- `POST /api/transactions/transfer` - P2P transfer
- `GET /api/transactions` - Get transaction history

### Conversion

- `POST /api/convert` - Convert USD ↔ BTC

### Virtual Cards

- `POST /api/virtual-cards` - Create virtual card
- `GET /api/virtual-cards` - Get user's cards

### Analytics

- `GET /api/analytics/summary` - Application statistics (analytics)

## 🔧 Development

### Database Operations

```bash
# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio

# Seed demo data
npm run seed
```

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Docker

```bash
# Build and run everything
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## 📊 Database Schema

### Core Models

- **User** - User accounts with roles
- **Wallet** - Multi-currency balances
- **Transaction** - All money movements
- **VirtualCard** - Generated cards
- **Category** - Expense categories

### Key Relationships

- User → Wallet (1:1)
- Wallet → Transactions (1:many)
- Wallet → VirtualCards (1:many)
- User → Transactions (1:many for P2P)

## 🔄 Real-time Features

The application uses Socket.IO for real-time updates:

- **Balance Updates** - Instant wallet balance changes
- **Transaction Notifications** - Real-time P2P alerts
- **Crypto Prices** - Live BTC price feed (10s intervals)
- **User-specific Rooms** - Targeted updates per user

## 🛡 Security Features

- **JWT Tokens** - Secure, stateless authentication
- **HTTP-only Cookies** - XSS protection
- **Password Hashing** - bcrypt with salt rounds
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Request sanitization
- **Rate Limiting** - API abuse prevention

## 📈 Performance

- **Database Indexing** - Optimized queries
- **Lazy Loading** - Component-level code splitting
- **WebSocket Efficiency** - Targeted room updates
- **Caching Strategy** - Redis-ready architecture
- **Pagination** - Infinite scroll transactions

## 🚀 Deployment

### Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=3001
```

### Production Build

```bash
# Frontend
npm run build

# Backend
npm start
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing Strategy

- **Unit Tests** - Jest for business logic
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Complete user flows
- **Load Testing** - Performance validation

## 📚 API Documentation

Full API documentation is available at `/api-docs` when running the server. The documentation includes:

- Request/response schemas
- Authentication requirements
- Example requests and responses
- Error codes and messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔧 Troubleshooting

### Common Issues

1. **Port 3000 already in use**

   - Change PORT in .env to 3001

2. **Database connection failed**

   - Ensure Docker is running
   - Check DATABASE_URL in .env

3. **Frontend can't reach backend**

   - Update axiosInstance baseURL
   - Check CORS configuration

4. **Socket.IO not connecting**
   - Verify WebSocket ports are open
   - Check firewall settings

## 🚀 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Two-factor authentication
- [ ] Crypto wallet integration
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Expense budgeting tools
