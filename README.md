<div align="center">

# Identity & Authentication Microservice

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)	](https://github.com/Briany4717/auth-system)[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)	](LICENSE)[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)	](https://nodejs.org)[![TypeScript](https://img.shields.io/badge/typescript-5.3.3-blue.svg)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)	](https://www.docker.com)[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)		](https://github.com/Briany4717/auth-system/pulls)[![Maintenance](https://img.shields.io/badge/maintained-yes-green.svg)](https://github.com/Briany4717/auth-system/graphs/commit-activity)

**An authentication and identity microservice built with modern security (AppSec) best practices.**

**[Why This?](#why-choose-this-auth-system)** • **[Features](#core-features)** • **[Quick Start](#getting-started)** • **[API](#api-endpoints)** • **[Security](#implemented-security-best-practices)** • **[Docs](docs/)**

---

## Table of Contents

- [Why Choose This Auth System?](#why-choose-this-auth-system)
- [Quick Stats](#quick-stats)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Security Best Practices](#implemented-security-best-practices)
- [Database Model](#database-model)
- [Configuration](#configuration)
- [RBAC](#role-based-access-control-rbac)
- [Production Deployment](#production-deployment)
- [Documentation](#additional-documentation)
- [Contributing](#contributing)
- [Author](#author)
- [Support](#support--community)
- [License](#license)
- [Version History](#version-history)
- [Changelog](CHANGELOG.md)

</div>

---

## Quick Stats

```text
Version: 1.0.0                    Dependencies: 12 production
Security: Enterprise-grade        Testing: Ready for implementation
TypeScript: 100%                  Docker: Multi-stage optimized
Endpoints: 20+                    Docs: Comprehensive
Auth Methods: JWT + 2FA           CORS: Dynamic management
```

---

## Why Choose This Auth System?

| Feature                          | Description                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| **Battle-Tested Security** | Implements OWASP guidelines with bcrypt, JWT rotation, and token theft detection    |
| **Production Ready**       | Docker containerization, rate limiting, and comprehensive error handling            |
| **Developer Friendly**     | Full TypeScript support, clean architecture, and extensive documentation            |
| **Dynamic CORS**           | Database-driven origin management with in-memory caching (no server restart needed) |
| **Audit Everything**       | Complete audit trail for compliance and security monitoring                         |
| **2FA/MFA Built-in**       | TOTP-based multi-factor authentication with backup codes                            |
| **RBAC Ready**             | Flexible role-based access control with middleware support                          |
| **Email Integration**      | Email verification and password reset flows included                                |

## Core Features

### Authentication & Security

- **JWT with Token Rotation**: Short-lived access tokens (15 min) and long-lived refresh tokens (7 days)
- **Secure Storage**: Refresh tokens stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies
- **Password Hashing**: Industry-standard `bcrypt` with configurable work factor (default: 12)
- **Rate Limiting**: Intelligent protection against brute-force attacks on critical endpoints
- **Token Theft Detection**: Hashed database tokens with rotation to detect compromised credentials
- **Dynamic CORS Management**: Database-driven with in-memory caching for optimal performance

### Enterprise-Grade Functionality

- **Complete Account Lifecycle**: Registration, login, token refresh, and secure logout
- **Email Verification**: One-time use tokens with configurable expiration for account activation
- **Password Recovery**: Secure password reset flow using temporary, time-limited tokens
- **Role-Based Access Control (RBAC)**: Pre-configured roles (`USER`, `ADMIN`, `MODERATOR`) with middleware protection
- **2FA/MFA with TOTP**: RFC 6238 compliant, compatible with Google Authenticator, Authy, and more
- **Backup Codes**: Secure account recovery mechanism for lost 2FA devices
- **Comprehensive Audit Trail**: Detailed logging for all security-sensitive actions with IP and device tracking
- **Admin Dashboard API**: Full CRUD operations for origin management and system configuration

## Technology Stack

### Core Technologies

| Category            | Technology     | Purpose                                    |
| ------------------- | -------------- | ------------------------------------------ |
| **Language**  | TypeScript 5.3 | Type safety and modern JavaScript features |
| **Runtime**   | Node.js 20+    | High-performance JavaScript runtime        |
| **Framework** | Express 4.x    | Fast, unopinionated web framework          |
| **Database**  | PostgreSQL 16  | Robust relational database                 |
| **ORM**       | Prisma 6.x     | Type-safe database client with migrations  |

### Security & Authentication

| Library                | Version | Purpose                               |
| ---------------------- | ------- | ------------------------------------- |
| `jsonwebtoken`       | ^9.0.2  | JWT token generation and verification |
| `bcrypt`             | ^5.1.1  | Password hashing with salt            |
| `otplib`             | ^12.0.1 | TOTP-based 2FA implementation         |
| `helmet`             | ^7.1.0  | Security headers middleware           |
| `express-rate-limit` | ^7.1.5  | Rate limiting and DDoS protection     |
| `cors`               | ^2.8.5  | Cross-Origin Resource Sharing         |

### Additional Dependencies

- **Email**: Nodemailer 7.x - Transactional email support
- **Validation**: express-validator 7.x - Input sanitization and validation
- **QR Codes**: qrcode 1.5.x - 2FA setup QR code generation
- **Logging**: winston 3.x - Structured application logging
- **Containerization**: Docker + Docker Compose - Consistent deployment environments

## Project Structure

```text
auth-system/
├── src/
│   ├── config/           # Environment and database configuration
│   ├── controllers/      # Route controllers
│   ├── middlewares/      # Rate limiting, authentication, authorization
│   ├── services/         # Business logic
│   ├── utils/            # JWT, validators, and other utilities
│   ├── types/            # TypeScript type definitions
│   ├── routes/           # Route definitions
│   ├── app.ts            # Express application setup
│   └── server.ts         # Application entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL (or use the provided Docker setup)

### Installation

1. **Clone the repository and install dependencies**:

   ```bash
   npm install
   ```
2. **Configure environment variables**:

   ```bash
   cp .env.example .env
   # Edit the .env file with your specific configuration
   ```
3. **Generate secure secret keys** (for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`):

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
4. **Start the database using Docker**:

   ```bash
   docker-compose up -d postgres
   ```
5. **Run Prisma migrations to set up the database schema**:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
6. **Start the development server**:

   ```bash
   npm run dev
   ```

The server will be available at `http://localhost:3000`.

### Docker Usage (Recommended for Production)

```bash
# Build and start all services in detached mode
docker-compose up -d

# View service logs
docker-compose logs -f

# Stop and remove all services
docker-compose down
```

## API Endpoints

### Public Authentication

| Method | Endpoint                             | Description                          |
| ------ | ------------------------------------ | ------------------------------------ |
| POST   | `/api/auth/register`               | Register a new user                  |
| POST   | `/api/auth/login`                  | Log in to an existing account        |
| POST   | `/api/auth/refresh`                | Refresh an expired access token      |
| POST   | `/api/auth/logout`                 | Log out and invalidate refresh token |
| GET    | `/api/auth/verify-email?token=xxx` | Verify a user's email address        |
| POST   | `/api/auth/forgot-password`        | Request a password reset             |
| POST   | `/api/auth/reset-password`         | Reset the password with a token      |

### Multi-Factor Authentication (MFA) - Authentication Required

| Method | Endpoint                  | Description                        |
| ------ | ------------------------- | ---------------------------------- |
| POST   | `/api/auth/mfa/enable`  | Enable 2FA (returns a QR code)     |
| POST   | `/api/auth/mfa/verify`  | Verify and activate 2FA            |
| POST   | `/api/auth/mfa/disable` | Disable 2FA for the user's account |

### User Management - Authentication Required

| Method | Endpoint               | Description                       |
| ------ | ---------------------- | --------------------------------- |
| GET    | `/api/users/profile` | Get the current user's profile    |
| PUT    | `/api/users/profile` | Update the current user's profile |
| DELETE | `/api/users/account` | Delete the current user's account |
| GET    | `/api/users`         | List all users (ADMIN only)       |

### Health Check

| Method | Endpoint    | Description                   |
| ------ | ----------- | ----------------------------- |
| GET    | `/health` | Get the service health status |

## Implemented Security Best Practices

### 1. Password Management

- **Hashing Algorithm**: `bcrypt` with a configurable work factor (default: 12).
- **Strong Password Policy**: Enforced at registration (minimum 8 characters, uppercase, lowercase, numbers, symbols).
- **Salting**: `bcrypt` handles salting automatically per-password.

### 2. JWT Tokens

- **Short-Lived Access Tokens**: 15-minute expiry forces regular re-authentication via refresh tokens.
- **Long-Lived Refresh Tokens**: 7-day expiry for persistent sessions.
- **Separate Secrets**: Access and refresh tokens are signed with different, strong secrets.
- **Standard Claims**: Includes `userId`, `email`, `roles`, `iss` (issuer), and `aud` (audience).

### 3. Token Storage

- **Access Tokens**: Stored in client-side memory.
- **Refresh Tokens**: Stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies to prevent XSS access.
- **Database Hashing**: Refresh tokens are hashed (`SHA-256`) in the database to detect theft.
- **Theft Detection**: Token rotation helps identify if a refresh token has been compromised.

### 4. Rate Limiting

- **Login/Register**: 5 attempts per 15 minutes.
- **Password Reset**: 3 attempts per hour.
- **MFA Verification**: 10 attempts per 15 minutes.
- **General API**: 100 requests per 15 minutes.

### 5. Additional Protections

- **Security Headers**: `Helmet.js` is used to set various HTTP security headers.
- **CORS**: Configured to restrict cross-origin requests.
- **Input Validation**: `express-validator` is used to sanitize and validate all incoming data.
- **Centralized Error Handling**: Prevents stack traces and sensitive information from being leaked.
- **Audit Logs**: All critical security events are logged for analysis.

### 6. 2FA/MFA

- **TOTP Standard**: Follows RFC 6238 for compatibility with standard authenticators.
- **QR Code Generation**: For easy setup with mobile authenticator apps.
- **Hashed Backup Codes**: Stored securely for account recovery.
- **Login Enforcement**: MFA is required at login if enabled for the account.

## Database Model

### User

- Basic information (email, name, hashed password).
- Roles (array of `USER`, `ADMIN`, `MODERATOR`).
- Email verification status.
- 2FA configuration details.
- Verification and password reset tokens.
- Timestamps (`createdAt`, `updatedAt`).

### RefreshToken

- Hashed token (`SHA-256`).
- Associated user.
- Expiration date.
- Revocation status.
- Device/IP information for auditing.

### AuditLog

- Record of all critical actions.
- User, action, and resource identifiers.
- Source IP address and User-Agent.
- Timestamp.

## Configuration

All configuration is managed via environment variables. Refer to `.env.example` for a complete list.

### Critical Environment Variables

```env
# JWT Secrets (GENERATE UNIQUE VALUES FOR PRODUCTION)
JWT_ACCESS_SECRET=your-super-secret-for-access-tokens
JWT_REFRESH_SECRET=your-super-secret-for-refresh-tokens

# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/auth_db"

# Email transport (example for Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Security
BCRYPT_ROUNDS=12
COOKIE_SECURE=true # Set to true in production
```

## Prisma Studio

To visually explore and manage your database:

```bash
npm run prisma:studio
```

## Role-Based Access Control (RBAC)

### Available Roles

- `USER`: Standard user with basic permissions.
- `MODERATOR`: Intermediate permissions for content management or user oversight.
- `ADMIN`: Full access to all system resources.

### Usage in Routes

```typescript
import { authenticate } from './middlewares/auth.middleware';
import { isAdmin, checkRole } from './middlewares/roleCheck.middleware';
import { Role } from '@prisma/client';

// Authenticated users only
router.get('/profile', authenticate, userController.getProfile);

// Administrators only
router.get('/users', authenticate, isAdmin, userController.getAllUsers);

// Custom role check
router.get('/custom-resource', authenticate, checkRole(Role.ADMIN, Role.MODERATOR), handler);
```

## Production Deployment

### Security Checklist

- [ ] Generate unique, strong secrets for all cryptographic operations (JWT, etc.).
- [ ] Set `NODE_ENV=production`.
- [ ] Set `COOKIE_SECURE=true` and ensure the application is served over HTTPS.
- [ ] Configure CORS to allow only trusted origins.
- [ ] Review and adjust rate-limiting thresholds based on expected traffic.
- [ ] Implement a robust database backup and recovery strategy.
- [ ] Set up monitoring, logging, and alerting for critical events.
- [ ] Establish a process for rotating secrets periodically.
- [ ] Regularly review audit logs for suspicious activity.

### Production Environment Variables

```env
NODE_ENV=production
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

## Additional Documentation

- [Getting Started Guide](docs/GETTING_STARTED.md) - Detailed setup and configuration
- [Architecture Overview](docs/ARCHITECTURE.md) - System design and patterns
- [API Examples](docs/API_EXAMPLES.md) - Complete curl examples for all endpoints
- [CORS Management API](docs/CORS_API.md) - Dynamic CORS configuration endpoints

## Contributing

This project follows clean code and strong typing principles. Contributions are welcome!

### Guidelines

- Follow existing TypeScript conventions
- Adhere to security best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Follow semantic versioning for releases
- Follow semantic versioning for releases

## Author

### Brian Gomez

Full-Stack Developer specializing in secure authentication systems and modern web architectures.

- GitHub: [@Briany4717](https://github.com/Briany4717)
- Email: <brianyan4717@gmail.com>
- Website: [briany.dev](https://briany.dev)

## Support & Community

### Getting Help

- **Documentation**: Check our comprehensive [docs](docs/) folder
- **Bug Reports**: [Open an issue](https://github.com/Briany4717/auth-system/issues/new?template=bug_report.md)
- **Feature Requests**: [Suggest a feature](https://github.com/Briany4717/auth-system/issues/new?template=feature_request.md)
- **Discussions**: [Join the conversation](https://github.com/Briany4717/auth-system/discussions)

### Stay Updated

- Star this repository to show support
- Watch for updates and new releases
- Follow [@Briany4717](https://github.com/Briany4717) for more projects

## Acknowledgments

Built with modern security practices and industry standards in mind. Special thanks to the open-source community for the excellent tools and libraries that made this project possible.

## License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

Copyright © 2025 Brian Gomez

## Version History

### v1.0.0 - Initial Release (October 2025)

**Core Authentication**

- ✅ Complete authentication flow (register, login, logout, refresh)
- ✅ JWT with token rotation and theft detection
- ✅ Secure HttpOnly cookie storage for refresh tokens
- ✅ Email verification system with expiring tokens
- ✅ Password reset functionality with secure token flow

**Security Features**

- ✅ 2FA/MFA with TOTP (Google Authenticator compatible)
- ✅ Backup codes for 2FA recovery
- ✅ Role-based access control (USER, ADMIN, MODERATOR)
- ✅ **NEW: Dynamic CORS management with admin API**
- ✅ Comprehensive audit logging with IP tracking
- ✅ Rate limiting protection (intelligent brute-force prevention)
- ✅ Password hashing with bcrypt (work factor 12)

**Infrastructure & DevOps**

- ✅ Docker containerization with multi-stage builds
- ✅ Docker Compose orchestration
- ✅ PostgreSQL database with Prisma ORM
- ✅ TypeScript for type safety
- ✅ Production-ready security headers (Helmet.js)
- ✅ Health check endpoints

**Developer Experience**

- ✅ Comprehensive API documentation
- ✅ curl examples for all endpoints
- ✅ Environment variable configuration
- ✅ Prisma Studio for database management
- ✅ Clean architecture with separation of concerns

### Roadmap

- [ ] OAuth 2.0 / OpenID Connect integration
- [ ] Social login providers (Google, GitHub, etc.)
- [ ] WebAuthn / FIDO2 support
- [ ] Session management dashboard
- [ ] Enhanced audit log analytics
- [ ] GraphQL API alternative
- [ ] Redis caching layer
- [ ] Kubernetes deployment configurations

## Disclaimer

This code is provided as a foundational template for building secure authentication systems. Before using it in a production environment, you **must**:

1. **Review & Customize**: Thoroughly review and adapt the code to your specific requirements and threat model.
2. **Security Testing**: Conduct comprehensive security testing, including penetration testing and vulnerability assessments.
3. **Professional Audit**: Consider engaging a third-party security auditor for critical applications.
4. **Dependency Management**: Keep all dependencies up-to-date to mitigate known vulnerabilities.
5. **Compliance**: Ensure compliance with relevant regulations (GDPR, CCPA, HIPAA, etc.) for your use case.
6. **Monitoring**: Implement robust monitoring, logging, and alerting in production environments.

**The authors and contributors are not responsible for any security issues or damages arising from the use of this software. Use at your own risk.**

---

## Show Your Support

If this project helped you or you find it useful, please consider:

- **Starring** the repository on GitHub
- **Forking** it for your own projects
- **Sharing** it with others who might benefit
- **Contributing** by reporting bugs or submitting PRs
- **Discussing** ideas and improvements

---

<div align="center">

### Made by [Brian Gomez](https://github.com/Briany4717)

**Thank you for checking out this project!**

*From idea to any screen, with accessibility, design, support, and care.*

[![GitHub followers](https://img.shields.io/github/followers/Briany4717?style=social)](https://github.com/Briany4717)

</div>
