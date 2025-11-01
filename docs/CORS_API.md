# CORS Management API Documentation

This document describes the complete CRUD API for managing allowed origins in the authentication microservice.

## Overview

The CORS Management API allows administrators to dynamically configure which origins (domains) are allowed to make cross-origin requests to the API. All changes are immediately synchronized with an in-memory cache for optimal performance.

## Authentication

All endpoints require:
- Valid JWT access token in the `Authorization` header
- User must have the `ADMIN` role

```bash
Authorization: Bearer <your_access_token>
```

## Base URL

```
http://localhost:3000/api/admin
```

---

## Endpoints

### 1. Get All Origins

Retrieve all allowed origins from the database (including inactive ones).

**Endpoint:** `GET /api/admin/origins`

**Response:**
```json
{
  "message": "Origins retrieved successfully",
  "count": 3,
  "data": [
    {
      "id": "uuid-1",
      "url": "https://app.example.com",
      "description": "Main application",
      "isActive": true,
      "createdAt": "2025-10-31T10:00:00.000Z",
      "updatedAt": "2025-10-31T10:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "url": "https://dashboard.example.com",
      "description": "Admin dashboard",
      "isActive": true,
      "createdAt": "2025-10-31T11:00:00.000Z",
      "updatedAt": "2025-10-31T11:00:00.000Z"
    }
  ]
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/admin/origins \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 2. Get Origin by ID

Retrieve a specific origin by its unique identifier.

**Endpoint:** `GET /api/admin/origins/:id`

**Response:**
```json
{
  "message": "Origin retrieved successfully",
  "data": {
    "id": "uuid-1",
    "url": "https://app.example.com",
    "description": "Main application",
    "isActive": true,
    "createdAt": "2025-10-31T10:00:00.000Z",
    "updatedAt": "2025-10-31T10:00:00.000Z"
  }
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/admin/origins/uuid-1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 3. Create New Origin

Add a new allowed origin to the system. The CORS cache will be automatically refreshed.

**Endpoint:** `POST /api/admin/origins`

**Request Body:**
```json
{
  "url": "https://nueva-app.com",
  "description": "Nueva aplicación frontend"
}
```

**Fields:**
- `url` (required): Must be a valid URL (protocol + domain)
- `description` (optional): Human-readable description

**Response:**
```json
{
  "message": "Origin created successfully",
  "data": {
    "id": "uuid-3",
    "url": "https://nueva-app.com",
    "description": "Nueva aplicación frontend",
    "isActive": true,
    "createdAt": "2025-10-31T12:00:00.000Z",
    "updatedAt": "2025-10-31T12:00:00.000Z"
  },
  "stats": {
    "totalOrigins": 8,
    "lastRefresh": "2025-10-31T12:00:00.000Z",
    "origins": ["https://nueva-app.com", "http://localhost:3000", ...]
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid URL format
```json
{
  "error": "Validation failed",
  "message": "Invalid URL format. Must be a valid URL (e.g., https://example.com)"
}
```

- `409 Conflict` - URL already exists
```json
{
  "error": "Conflict",
  "message": "This URL already exists in the allowed origins"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/admin/origins \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://nueva-app.com",
    "description": "Nueva aplicación frontend"
  }'
```

---

### 4. Update Origin

Update an existing origin's URL, description, or active status. The CORS cache will be automatically refreshed.

**Endpoint:** `PUT /api/admin/origins/:id`

**Request Body:**
```json
{
  "url": "https://app-actualizada.com",
  "description": "Descripción actualizada",
  "isActive": false
}
```

**Fields (all optional, but at least one required):**
- `url`: New URL
- `description`: New description
- `isActive`: Active status (true/false)

**Response:**
```json
{
  "message": "Origin updated successfully",
  "data": {
    "id": "uuid-1",
    "url": "https://app-actualizada.com",
    "description": "Descripción actualizada",
    "isActive": false,
    "createdAt": "2025-10-31T10:00:00.000Z",
    "updatedAt": "2025-10-31T13:00:00.000Z"
  },
  "stats": {
    "totalOrigins": 7,
    "lastRefresh": "2025-10-31T13:00:00.000Z",
    "origins": [...]
  }
}
```

**Error Responses:**

- `404 Not Found` - Origin doesn't exist
```json
{
  "error": "Not found",
  "message": "Origin not found"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/admin/origins/uuid-1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Descripción actualizada",
    "isActive": false
  }'
```

---

### 5. Delete Origin

Permanently delete an origin from the database. The CORS cache will be automatically refreshed.

**Endpoint:** `DELETE /api/admin/origins/:id`

**Response:**
```json
{
  "message": "Origin deleted successfully",
  "data": {
    "id": "uuid-1",
    "url": "https://app-vieja.com",
    "description": "Aplicación antigua",
    "isActive": true,
    "createdAt": "2025-10-31T10:00:00.000Z",
    "updatedAt": "2025-10-31T10:00:00.000Z"
  },
  "stats": {
    "totalOrigins": 6,
    "lastRefresh": "2025-10-31T14:00:00.000Z",
    "origins": [...]
  }
}
```

**Error Responses:**

- `404 Not Found` - Origin doesn't exist
```json
{
  "error": "Not found",
  "message": "Origin not found"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/admin/origins/uuid-1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 6. Toggle Origin Status

Quickly enable or disable an origin without updating other fields. The CORS cache will be automatically refreshed.

**Endpoint:** `PATCH /api/admin/origins/:id/toggle`

**Response:**
```json
{
  "message": "Origin deactivated successfully",
  "data": {
    "id": "uuid-1",
    "url": "https://app.example.com",
    "description": "Main application",
    "isActive": false,
    "createdAt": "2025-10-31T10:00:00.000Z",
    "updatedAt": "2025-10-31T15:00:00.000Z"
  },
  "stats": {
    "totalOrigins": 6,
    "lastRefresh": "2025-10-31T15:00:00.000Z",
    "origins": [...]
  }
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/admin/origins/uuid-1/toggle \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 7. Get CORS Cache Stats

View current cache statistics and active origins in memory.

**Endpoint:** `GET /api/admin/cors`

**Response:**
```json
{
  "totalOrigins": 8,
  "lastRefresh": "2025-10-31T15:00:00.000Z",
  "origins": [
    "https://app.example.com",
    "https://dashboard.example.com",
    "http://localhost:3000",
    "http://localhost:5173",
    "..."
  ],
  "message": "CORS configuration retrieved successfully"
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/admin/cors \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 8. Refresh CORS Cache

Manually trigger a cache refresh from the database (normally done automatically after modifications).

**Endpoint:** `POST /api/admin/cors/refresh`

**Response:**
```json
{
  "message": "CORS cache refreshed successfully",
  "stats": {
    "totalOrigins": 8,
    "lastRefresh": "2025-10-31T16:00:00.000Z",
    "origins": [...]
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/admin/cors/refresh \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Development Mode

In development mode (`NODE_ENV=development`), the following origins are automatically allowed:

- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173` (Vite default)
- `http://localhost:4200` (Angular default)
- `http://127.0.0.1:3000`

These development origins **do not** need to be added to the database and will always be available in dev mode.

---

## Cache Behavior

1. **Automatic Refresh**: The cache is automatically refreshed after any CREATE, UPDATE, DELETE, or TOGGLE operation
2. **Server Startup**: Cache is loaded from database on server initialization
3. **Manual Refresh**: Admins can trigger a manual refresh using the `/api/admin/cors/refresh` endpoint
4. **Active Only**: Only origins with `isActive: true` are loaded into the cache
5. **In-Memory Performance**: All CORS checks are performed against the in-memory cache for optimal performance

---

## Error Handling

All endpoints follow consistent error response formats:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200 OK` - Successful GET, PUT, DELETE, PATCH
- `201 Created` - Successful POST (creation)
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User doesn't have ADMIN role
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate URL
- `500 Internal Server Error` - Server-side error

---

## Testing with curl

### Complete workflow example:

```bash
# 1. Login as admin
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}' \
  | jq -r '.accessToken')

# 2. Get all origins
curl -X GET http://localhost:3000/api/admin/origins \
  -H "Authorization: Bearer $TOKEN"

# 3. Create new origin
curl -X POST http://localhost:3000/api/admin/origins \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://myapp.com","description":"My App"}'

# 4. Update origin
curl -X PUT http://localhost:3000/api/admin/origins/ORIGIN_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated description"}'

# 5. Toggle status
curl -X PATCH http://localhost:3000/api/admin/origins/ORIGIN_ID/toggle \
  -H "Authorization: Bearer $TOKEN"

# 6. Delete origin
curl -X DELETE http://localhost:3000/api/admin/origins/ORIGIN_ID \
  -H "Authorization: Bearer $TOKEN"

# 7. Check cache stats
curl -X GET http://localhost:3000/api/admin/cors \
  -H "Authorization: Bearer $TOKEN"
```

---

## Security Considerations

1. **Admin Only**: All endpoints require ADMIN role - regular users cannot access
2. **JWT Required**: Valid access token must be provided in Authorization header
3. **URL Validation**: All URLs are validated to ensure proper format
4. **Duplicate Prevention**: System prevents duplicate URLs from being added
5. **Audit Trail**: Consider logging all CORS configuration changes for security auditing

---

## Best Practices

1. **Use HTTPS**: Always use HTTPS URLs in production (e.g., `https://app.example.com`)
2. **Specific Origins**: Avoid wildcards - specify exact origins for security
3. **Regular Review**: Periodically review and remove unused origins
4. **Testing**: Test CORS configuration before deploying to production
5. **Documentation**: Document which applications use which origins
