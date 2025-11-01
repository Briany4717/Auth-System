# Quick Start Guide - Auth System

## Project Status

The authentication microservice has been successfully generated with the following components in place:

- Complete file and directory structure.
- Strongly-typed TypeScript source code.
- All required dependencies installed.
- Prisma Client successfully generated.
- The project compiles without errors.

## Next Steps for Production Readiness

### 1. Configure Environment Variables

First, edit the `.env` file to include your specific configuration values.

```bash
# Generate secure secrets (run this command twice):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Update the following variables in your `.env` file:

- `JWT_ACCESS_SECRET` - Use the first generated key.
- `JWT_REFRESH_SECRET` - Use the second generated key.
- `EMAIL_*` - Your SMTP server configuration.
- `DATABASE_URL` - The connection string for your PostgreSQL database.

### 2. Start the Database

#### Option A: With Docker (Recommended)

```bash
docker-compose up -d postgres
```

#### Option B: Local PostgreSQL Instance

Ensure you have a local PostgreSQL server running and that the `DATABASE_URL` in `.env` is correctly configured to connect to it.

### 3. Run Database Migrations

```bash
# Create and apply the initial migration
npm run prisma:migrate

# (Optional) Verify the schema with Prisma Studio
npm run prisma:studio
```

### 4. Start the Server

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm run build
npm start
```

#### With Docker (Full Stack)

```bash
docker-compose up -d
```

## System Testing

### 1. Health Check

Verify that the service is running correctly.

```bash
curl http://localhost:3000/health
```

### 2. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 3. Log In (After Email Verification)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Note:** For development purposes, you can manually mark the user's email as verified using Prisma Studio.

### 4. Access a Protected Endpoint

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Key Generated Files

### Configuration

- `src/config/env.ts` - Environment variable management.
- `src/config/database.ts` - Prisma client instance.

### Core Services

- `src/services/auth.service.ts` - Core authentication logic.
- `src/services/email.service.ts` - Email sending service.
- `src/services/totp.service.ts` - 2FA/MFA logic.

### Controllers

- `src/controllers/auth.controller.ts` - Authentication endpoints.
- `src/controllers/user.controller.ts` - User management endpoints.

### Security Middleware

- `src/middlewares/auth.middleware.ts` - JWT verification.
- `src/middlewares/roleCheck.middleware.ts` - RBAC enforcement.
- `src/middlewares/rateLimiter.middleware.ts` - Brute-force protection.

### Utilities

- `src/utils/jwt.strategy.ts` - JWT generation and verification.
- `src/utils/password.utils.ts` - Password hashing utilities.
- `src/utils/validators.ts` - Input validation rules.

### Routes

- `src/routes/auth.routes.ts` - Authentication routes.
- `src/routes/user.routes.ts` - User-related routes.

## Available Endpoints

### Public

- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Log in.
- `POST /api/auth/refresh` - Refresh an access token.
- `POST /api/auth/logout` - Log out.
- `GET /api/auth/verify-email?token=xxx` - Verify email address.
- `POST /api/auth/forgot-password` - Request a password reset.
- `POST /api/auth/reset-password` - Complete a password reset.

### Protected (JWT Required)

- `GET /api/users/profile` - View user profile.
- `PUT /api/users/profile` - Update user profile.
- `DELETE /api/users/account` - Delete user account.
- `POST /api/auth/mfa/enable` - Enable 2FA.
- `POST /api/auth/mfa/verify` - Verify 2FA token.
- `POST /api/auth/mfa/disable` - Disable 2FA.

### Admin Only

- `GET /api/users` - List all users.

## Useful Scripts

```bash
# Development
npm run dev                 # Start server with hot-reload

# Build
npm run build               # Compile TypeScript to JavaScript

# Production
npm start                   # Start the compiled server

# Prisma
npm run prisma:generate     # Generate Prisma Client
npm run prisma:migrate      # Create and apply a new migration
npm run prisma:push         # Push schema changes to the DB (dev only)
npm run prisma:studio       # Open the visual database interface

# Docker
npm run docker:up           # Start all containers
npm run docker:down         # Stop all containers
npm run docker:logs         # View container logs
```

## Production Security Checklist

- [ ] Generate unique and strong secrets for all cryptographic operations.
- [ ] Set `NODE_ENV=production` in your production environment.
- [ ] Set `COOKIE_SECURE=true` and serve the application over HTTPS.
- [ ] Configure CORS to allow only trusted domains.
- [ ] Review and adjust rate-limiting thresholds based on expected traffic.
- [ ] Validate and secure the SMTP email configuration.
- [ ] Implement an automated database backup and recovery strategy.
- [ ] Configure centralized logging for monitoring and auditing.
- [ ] Set up monitoring and alerting for critical system events.
- [ ] Harden network security with a properly configured firewall.
- [ ] Conduct a thorough security code review.

## Monitoring

### Audit Logs

All critical security events are recorded in the `AuditLog` table, including:

- User registrations.
- Successful and failed login attempts.
- Password changes.
- 2FA status changes (enable/disable).

Query these logs using Prisma Studio or by connecting directly to the database.

### Health Check

The `/health` endpoint returns the service status:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-30T...",
  "uptime": 12345.67
}
```

## Troubleshooting

### Error: "Cannot connect to database"

- Ensure the PostgreSQL service is running.
- Verify the `DATABASE_URL` in your `.env` file is correct.
- If using Docker, confirm the container is up: `docker-compose up -d postgres`.

### Error: "Invalid token"

- Access tokens expire after 15 minutes.
- Use the `/refresh` endpoint with the refresh token cookie to get a new access token.
- Confirm that the `JWT_ACCESS_SECRET` is correctly configured.

### Error: "Too many requests"

- The rate limiter has been triggered.
- Wait for the specified duration before trying again.
- If necessary, adjust the limits in `src/config/env.ts` for your specific use case.

### Emails are not being sent

- Verify the SMTP configuration in your `.env` file.
- If using Gmail, ensure you are using an "App Password".
- Check the server logs for any transport errors from Nodemailer.

## Additional Documentation

- [README.md](./README.md) - Main project documentation.
- [Prisma Schema](./prisma/schema.prisma) - Database data model.
- [.env.example](./.env.example) - List of all environment variables.

---

**Disclaimer**: This is an enterprise-grade authentication system. Before deploying to production, you must:

1. **Conduct a full security audit.**
2. **Exhaustively test all authentication and authorization flows.**
3. **Configure automated database backups.**
4. **Implement robust monitoring and alerting.**
5. **Document any customizations or changes.**
6. **Keep all dependencies up-to-date.**
7. **Establish a process for rotating secrets periodically.**

The system is now ready for further development and configuration. Follow the steps above to prepare it for a production environment.
