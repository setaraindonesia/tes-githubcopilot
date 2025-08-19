# 🔐 Auth Service

Authentication & Authorization microservice for Setaradapps.

## 🚀 Features

- User registration and login
- JWT token management
- Password hashing with bcrypt
- Session management
- Role-based access control (RBAC)
- Multi-factor authentication support
- Password reset functionality

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **Testing**: Jest

## 📁 Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # User management
├── sessions/       # Session handling
├── guards/         # Route guards
├── decorators/     # Custom decorators
├── dto/           # Data transfer objects
├── entities/      # Database entities
└── main.ts        # Application entry point
```

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Setup database**
   ```bash
   npm run migrate
   npm run seed
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/:id` - Get user by ID (admin only)
- `PUT /users/:id` - Update user (admin only)
- `DELETE /users/:id` - Delete user (admin only)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `PORT` | Service port | `3001` |

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 🐳 Docker

```bash
# Build image
docker build -f Dockerfile.dev -t setaradapps-auth-service .

# Run container
docker run -p 3001:3001 setaradapps-auth-service
```

## 📚 Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT.io](https://jwt.io/)
