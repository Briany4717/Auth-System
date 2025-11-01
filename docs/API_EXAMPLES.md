# API Examples - Request Collection

This file provides `curl` examples for testing all endpoints of the authentication system.

## Environment Variables

Set these variables in your shell before running the commands.

```bash
# Configure these variables first
export API_BASE_URL="http://localhost:3000"
export ACCESS_TOKEN="your_access_token_here"
export REFRESH_TOKEN="your_refresh_token_here"
```

## 1. Health Check

Verify that the server is running and healthy.

```bash
curl -X GET $API_BASE_URL/health
```

## 2. User Registration

Register a new user account.

```bash
curl -X POST $API_BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Expected Response:
# {
#   "user": { "id": "...", "email": "john.doe@example.com", ... },
#   "message": "Registration successful. Please check your email to verify your account."
# }
```

## 3. Email Verification

Verify a user's email address using the token sent to them.

```bash
# The token is sent to the user's email
curl -X GET "$API_BASE_URL/api/auth/verify-email?token=TOKEN_FROM_EMAIL"

# Expected Response:
# {
#   "message": "Email verified successfully"
# }
```

## 4. Login

### Standard Login (No MFA)

```bash
# Basic login request
curl -X POST $API_BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'

# Expected Response:
# {
#   "user": { "id": "...", "email": "john.doe@example.com", "roles": ["USER"] },
#   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "message": "Login successful"
# }
# An HttpOnly `refreshToken` cookie is also set.
```

### Login with MFA

```bash
# Login with a 2FA/TOTP code
curl -X POST $API_BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "totpCode": "123456"
  }'
```

## 5. Accessing Protected Resources

Fetch the current user's profile.

```bash
curl -X GET $API_BASE_URL/api/users/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Expected Response:
# {
#   "id": "...",
#   "email": "john.doe@example.com",
#   ...
# }
```

## 6. Updating a Profile

Update the user's first and last name.

```bash
curl -X PUT $API_BASE_URL/api/users/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jonathan",
    "lastName": "Doe-Smith"
  }'
```

## 7. Refreshing an Access Token

Use the refresh token (sent as a cookie) to get a new access token.

```bash
# Using the cookie file
curl -X POST $API_BASE_URL/api/auth/refresh \
  -b cookies.txt

# Or by passing the cookie directly
curl -X POST $API_BASE_URL/api/auth/refresh \
  -H "Cookie: refreshToken=$REFRESH_TOKEN"

# Expected Response:
# {
#   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }
```

## 8. Password Recovery

### Request a Password Reset

```bash
curl -X POST $API_BASE_URL/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'

# Expected Response:
# {
#   "message": "If an account with that email exists, a password reset link has been sent."
# }
```

### Reset the Password

```bash
curl -X POST $API_BASE_URL/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL",
    "password": "NewSecurePass456!"
  }'

# Expected Response:
# {
#   "message": "Password has been reset successfully."
# }
```

## 9. Two-Factor Authentication (2FA/MFA)

### Enable 2FA

```bash
# This requires authentication
curl -X POST $API_BASE_URL/api/auth/mfa/enable \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Expected Response:
# {
#   "qrCode": "data:image/png;base64,iVBORw0KGgo...",
#   "secret": "JBSWY3DPEHPK3PXP",
#   "backupCodes": [ "1A2B-3C4D", ... ],
#   "message": "Scan the QR code with your authenticator app and verify with a code."
# }
```

### Verify and Activate 2FA

```bash
curl -X POST $API_BASE_URL/api/auth/mfa/verify \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456"
  }'

# Expected Response:
# {
#   "message": "MFA has been enabled successfully."
# }
```

### Disable 2FA

```bash
# Requires a current, valid TOTP code
curl -X POST $API_BASE_URL/api/auth/mfa/disable \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456"
  }'

# Expected Response:
# {
#   "message": "MFA has been disabled successfully."
# }
```

## 10. Logout

Invalidates the user's refresh token on the server.

```bash
curl -X POST $API_BASE_URL/api/auth/logout \
  -b cookies.txt

# Expected Response:
# {
#   "message": "Logout successful"
# }
```

## 11. Admin Endpoints

### List All Users (Admin Only)

```bash
curl -X GET $API_BASE_URL/api/users \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Expected Response (for an ADMIN user):
# {
#   "users": [ { "id": "...", "email": "...", ... } ],
#   "count": 10
# }
```

## 12. Delete Account

Performs a soft delete by deactivating the user's account.

```bash
curl -X DELETE $API_BASE_URL/api/users/account \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Expected Response:
# {
#   "message": "Account has been deactivated successfully."
# }
```

## Important Notes

### Cookie Handling

To save and use cookies with `curl`:

- `-c cookies.txt`: Saves cookies to a file.
- `-b cookies.txt`: Reads cookies from a file.

### Authentication Header

Always include the access token in the `Authorization` header for protected routes:
`Authorization: Bearer YOUR_TOKEN_HERE`

### Debugging

For more detailed request/response information:

- `curl -v`: Verbose mode.
- `curl -i`: Include HTTP response headers in the output.

### JSON Formatting

Pipe the output to `jq` for pretty-printing:
`curl ... | jq '.'`

## Expected Status Codes

| Code | Meaning               | When It Occurs                               |
| ---- | --------------------- | -------------------------------------------- |
| 200  | OK                    | Successful GET, PUT, DELETE requests.        |
| 201  | Created               | Successful resource creation (e.g., user registration). |
| 400  | Bad Request           | Input validation failed.                     |
| 401  | Unauthorized          | Missing, invalid, or expired access token.   |
| 403  | Forbidden             | Insufficient permissions (RBAC failure).     |
| 404  | Not Found             | The requested resource does not exist.       |
| 409  | Conflict              | The resource already exists (e.g., duplicate email). |
| 429  | Too Many Requests     | The rate limit has been exceeded.            |
| 500  | Internal Server Error | An unexpected server-side error occurred.    |
