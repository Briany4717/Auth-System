# System Architecture - Identity Provider

## General Design

This microservice follows a Layered Architecture with a clear separation of concerns.

```text
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│           (Mobile Apps, SPAs, Backend Services)              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY LAYER                        │
│                    (Express + Middleware)                    │
│  - CORS                  - Rate Limiting                     │
│  - Helmet Security       - Cookie Parser                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      ROUTES LAYER                            │
│  /api/auth/*           /api/users/*                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   MIDDLEWARE LAYER                           │
│  - Authentication        - Authorization (RBAC)              │
│  - Validation            - Rate Limiting                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   CONTROLLER LAYER                           │
│  - auth.controller       - user.controller                   │
│  (Request handling, validation, response formatting)         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  - auth.service          - email.service                     │
│  - totp.service          - token.service                     │
│  (Business logic, orchestration)                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA ACCESS LAYER                        │
│                     (Prisma ORM)                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│                     (PostgreSQL)                             │
│  - Users          - RefreshTokens      - AuditLogs          │
└─────────────────────────────────────────────────────────────┘
```

## JWT Authentication Flow

### Login Flow

```text
┌──────┐                                                    ┌──────────┐
│Client│                                                    │  Server  │
└───┬──┘                                                    └────┬─────┘
    │                                                            │
    │  POST /api/auth/login                                     │
    │  { email, password, [totpCode] }                          │
    ├──────────────────────────────────────────────────────────>│
    │                                                            │
    │                          ┌─────────────────────────────┐  │
    │                          │ 1. Validate credentials     │  │
    │                          │ 2. Check if account active  │  │
    │                          │ 3. Verify email             │  │
    │                          │ 4. Check MFA (if enabled)   │  │
    │                          │ 5. Generate access token    │  │
    │                          │ 6. Generate refresh token   │  │
    │                          │ 7. Hash & store refresh tok │  │
    │                          │ 8. Update last login        │  │
    │                          │ 9. Create audit log         │  │
    │                          └─────────────────────────────┘  │
    │                                                            │
    │  200 OK                                                   │
    │  Set-Cookie: refreshToken=xxx; HttpOnly; Secure          │
    │  { user, accessToken }                                    │
    │<──────────────────────────────────────────────────────────┤
    │                                                            │
```

### Accessing Protected Resource

```text
┌──────┐                                                    ┌──────────┐
│Client│                                                    │  Server  │
└───┬──┘                                                    └────┬─────┘
    │                                                            │
    │  GET /api/users/profile                                   │
    │  Authorization: Bearer <access_token>                     │
    ├──────────────────────────────────────────────────────────>│
    │                                                            │
    │                          ┌─────────────────────────────┐  │
    │                          │ 1. Extract JWT from header  │  │
    │                          │ 2. Verify signature         │  │
    │                          │ 3. Check expiration         │  │
    │                          │ 4. Decode payload           │  │
    │                          │ 5. Attach user to request   │  │
    │                          │ 6. Check role (if needed)   │  │
    │                          │ 7. Execute controller       │  │
    │                          └─────────────────────────────┘  │
    │                                                            │
    │  200 OK                                                   │
    │  { user: {...} }                                          │
    │<──────────────────────────────────────────────────────────┤
    │                                                            │
```

### Token Refresh Flow

```text
┌──────┐                                                    ┌──────────┐
│Client│                                                    │  Server  │
└───┬──┘                                                    └────┬─────┘
    │                                                            │
    │  POST /api/auth/refresh                                   │
    │  Cookie: refreshToken=xxx                                 │
    ├──────────────────────────────────────────────────────────>│
    │                                                            │
    │                          ┌─────────────────────────────┐  │
    │                          │ 1. Extract refresh token    │  │
    │                          │ 2. Verify JWT signature     │  │
    │                          │ 3. Hash token               │  │
    │                          │ 4. Check DB (not revoked)   │  │
    │                          │ 5. Verify user still active │  │
    │                          │ 6. Generate new access tok  │  │
    │                          └─────────────────────────────┘  │
    │                                                            │
    │  200 OK                                                   │
    │  { accessToken: "new_jwt..." }                            │
    │<──────────────────────────────────────────────────────────┤
    │                                                            │
```

## Security Model

### Defense in Depth

```text
┌────────────────────────────────────────────────────────────────┐
│ Layer 1: Network Security                                      │
│ - HTTPS/TLS                                                    │
│ - Firewall                                                     │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ Layer 2: Application Security                                  │
│ - Helmet (Security Headers)                                    │
│ - CORS                                                         │
│ - Rate Limiting                                                │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ Layer 3: Authentication                                        │
│ - JWT Tokens (signed)                                          │
│ - Refresh Token Rotation                                       │
│ - 2FA/MFA (TOTP)                                               │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ Layer 4: Authorization                                         │
│ - RBAC (Role-Based Access Control)                             │
│ - Middleware Checks                                            │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ Layer 5: Data Protection                                       │
│ - Bcrypt Password Hashing                                      │
│ - Token Hashing in DB                                          │
│ - Secure Cookie Storage                                        │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ Layer 6: Monitoring & Auditing                                 │
│ - Audit Logs                                                   │
│ - Failed Login Tracking                                        │
│ - Security Event Logging                                       │
└────────────────────────────────────────────────────────────────┘
```

## Implemented Design Patterns

### 1. Singleton Pattern
-   **Where**: Prisma client, services (`authService`, `emailService`).
-   **Why**: Ensures a single instance for database connections and services, improving performance and managing state.

### 2. Middleware Pattern
-   **Where**: Express middlewares for authentication, validation, and rate limiting.
-   **Why**: Allows for a clean, chainable request processing pipeline.

### 3. Strategy Pattern
-   **Where**: JWT generation and verification logic.
-   **Why**: Encapsulates different token strategies (access vs. refresh) and allows them to be interchangeable.

### 4. Repository Pattern
-   **Where**: Abstracted via the Prisma ORM.
-   **Why**: Decouples business logic from data access logic, making the system more modular.

### 5. Factory Pattern
-   **Where**: Token generation and backup code creation.
-   **Why**: Provides a consistent interface for creating complex objects.

## Data Model

```text
┌─────────────────────────────────────────────┐
│                 User                         │
├─────────────────────────────────────────────┤
│ id: UUID (PK)                               │
│ email: String (UNIQUE)                      │
│ password: String (HASHED)                   │
│ firstName: String?                          │
│ lastName: String?                           │
│ roles: Role[] (ENUM)                        │
│ isEmailVerified: Boolean                    │
│ emailVerificationToken: String? (UNIQUE)    │
│ emailVerificationExpiry: DateTime?          │
│ isMfaEnabled: Boolean                       │
│ mfaSecret: String?                          │
│ mfaBackupCodes: String[]                    │
│ passwordResetToken: String? (UNIQUE)        │
│ passwordResetExpiry: DateTime?              │
│ isActive: Boolean                           │
│ lastLoginAt: DateTime?                      │
│ createdAt: DateTime                         │
│ updatedAt: DateTime                         │
└────────────┬────────────────────────────────┘
             │
             │ 1:N
             │
             ▼
┌─────────────────────────────────────────────┐
│            RefreshToken                      │
├─────────────────────────────────────────────┤
│ id: UUID (PK)                               │
│ hashedToken: String (UNIQUE, INDEXED)       │
│ userId: UUID (FK → User.id)                 │
│ expiresAt: DateTime                         │
│ createdAt: DateTime                         │
│ isRevoked: Boolean                          │
│ revokedAt: DateTime?                        │
│ replacedByToken: String?                    │
│ deviceInfo: String?                         │
│ ipAddress: String?                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│              AuditLog                        │
├─────────────────────────────────────────────┤
│ id: UUID (PK)                               │
│ userId: String? (INDEXED)                   │
│ action: String (INDEXED)                    │
│ resource: String?                           │
│ details: Json?                              │
│ ipAddress: String?                          │
│ userAgent: String?                          │
│ success: Boolean                            │
│ createdAt: DateTime (INDEXED)               │
└─────────────────────────────────────────────┘
```

## Token Management

### Access Token (JWT)
-   **Duration**: 15 minutes.
-   **Storage**: Client-side memory (e.g., a variable in a SPA).
-   **Payload**: `{ userId, email, roles, iat, exp, iss, aud }`.
-   **Usage**: Sent in the `Authorization` header for every request to protected endpoints.

### Refresh Token (JWT)
-   **Duration**: 7 days.
-   **Storage**: `HttpOnly` cookie and hashed in the database.
-   **Payload**: `{ userId, email, roles, iat, exp, iss, aud }`.
-   **Usage**: Used exclusively to obtain a new access token.

### Secure Token Flow
```text
CLIENT                          SERVER                   DATABASE
  │                               │                          │
  │  Login Request                │                          │
  ├──────────────────────────────>│                          │
  │                               │                          │
  │                               │  Generate Tokens         │
  │                               │  - Access (JWT)          │
  │                               │  - Refresh (JWT)         │
  │                               │                          │
  │                               │  Hash Refresh Token      │
  │                               │  (SHA-256)               │
  │                               ├─────────────────────────>│
  │                               │  Store Hashed Token      │
  │                               │                          │
  │  Access Token (Response Body) │                          │
  │  Refresh Token (HttpOnly Cookie)                         │
  │<──────────────────────────────┤                          │
  │                               │                          │
  │  Store Access in Memory       │                          │
  │                               │                          │
```

## Threat Mitigation

| Threat                | Mitigation                                      |
| --------------------- | ----------------------------------------------- |
| **Brute Force**       | Rate limiting on critical endpoints (e.g., 5 attempts/15 min). |
| **XSS**               | `HttpOnly` cookies for refresh tokens; Content Security Policy (CSP) headers. |
| **CSRF**              | `SameSite=Strict` cookies; CORS configuration. |
| **Token Theft**       | Hashed tokens in the database; token rotation. |
| **SQL Injection**     | Prisma ORM ensures parameterized queries. |
| **Password Attacks**  | `bcrypt` hashing (work factor 12); strong password policies. |
| **Session Hijacking** | Short token expiration; device/IP tracking on refresh. |
| **Man-in-the-Middle** | Enforced HTTPS; `Secure` flag on cookies. |
| **Account Takeover**  | 2FA/MFA; mandatory email verification. |
| **Replay Attacks**    | Token expiration (`exp` claim); `jti` (JWT ID) for uniqueness. |

## Full User Lifecycle

```text
┌─────────────┐
│ REGISTRATION│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Email Verification Pending  │
└──────┬──────────────────────┘
       │ (User clicks email link)
       ▼
┌─────────────────┐
│ Email Verified  │
└──────┬──────────┘
       │
       ▼
┌─────────────┐
│    LOGIN    │──────> [MFA Enabled?] ──Yes──> Enter TOTP Code
└──────┬──────┘              │                        │
       │                     No                       │
       └─────────────────────┴────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Authenticated   │
                    │ (Access/Refresh)│
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
    ┌──────────┐      ┌───────────┐     ┌──────────┐
    │ Access   │      │  Update   │     │ Enable   │
    │Resources │      │ Profile   │     │   2FA    │
    └──────────┘      └───────────┘     └──────────┘
          │
          ▼ (Access token expires)
    ┌──────────┐
    │ Refresh  │
    │  Token   │
    └──────────┘
          │
          ▼
    ┌──────────┐
    │  Logout  │
    └──────────┘
```

## Core Dependencies and Their Purpose

| Dependency           | Version | Purpose                               |
| -------------------- | ------- | ------------------------------------- |
| `express`            | ^4.18   | Web framework for Node.js.            |
| `@prisma/client`     | ^5.7    | ORM for PostgreSQL.                   |
| `jsonwebtoken`       | ^9.0    | JWT generation and verification.      |
| `bcrypt`             | ^5.1    | Password hashing.                     |
| `otplib`             | ^12.0   | TOTP library for 2FA.                 |
| `nodemailer`         | ^6.9    | Email sending.                        |
| `helmet`             | ^7.1    | HTTP security headers.                |
| `express-rate-limit` | ^7.1    | Request rate limiting.                |
| `express-validator`  | ^7.0    | Input validation and sanitization.    |
| `cors`               | ^2.8    | Cross-Origin Resource Sharing.        |
| `cookie-parser`      | ^1.4    | Cookie parsing middleware.            |
| `qrcode`             | ^1.5    | QR code generation for 2FA setup.     |

## Scalability

### Horizontal Scaling

The service is designed to be stateless, allowing for horizontal scaling.

```text
        ┌──────────────┐
        │ Load Balancer│
        └───────┬──────┘
                │
     ┌──────────┼──────────┐
     ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Auth    │ │ Auth    │ │ Auth    │
│ Service │ │ Service │ │ Service │
│ Node 1  │ │ Node 2  │ │ Node 3  │
└────┬────┘ └────┬────┘ └────┬────┘
     │           │           │
     └───────────┼───────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   PostgreSQL    │
        │  (with replicas)│
        └─────────────────┘
```

**Considerations**:

- The stateless design (JWTs managed by the client) simplifies scaling.
- Refresh tokens are stored in a shared database, accessible by all nodes.
- Rate limiting is based on IP; for a distributed setup, a centralized store like Redis should be considered.
- Session affinity (sticky sessions) is not required.

## Recommended Metrics for Monitoring

1. **Authentication Metrics**
    - Login success/failure rate.
    - Endpoint response times (p95, p99).
    - Number of active vs. expired tokens.

2. **Security Metrics**
    - Brute-force attempts detected.
    - Number of revoked tokens.
    - MFA activation rates.

3. **Infrastructure Metrics**
    - CPU and memory utilization.
    - Database connection pool usage.
    - API latency.

---

This document outlines the high-level architecture of the system. For implementation details, please refer to the source code and inline comments.
