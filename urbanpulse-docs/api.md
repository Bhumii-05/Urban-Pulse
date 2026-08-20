# UrbanPulse API Documentation

This document outlines all REST API endpoints available in the UrbanPulse Smart Waste Management System.

---

# 1. Authentication & Profile APIs

These APIs manage user registration, authentication, and profile operations.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/register` | Register a new citizen account | Public |
| POST | `/api/v1/auth/login` | Authenticate user and return JWT tokens | Public |
| POST | `/api/v1/auth/forgot-password` | Request password reset | Public |
| POST | `/api/v1/auth/refresh` | Refresh access token | Authenticated |
| GET | `/api/v1/profile` | Get current user's profile | Authenticated |
| PATCH | `/api/v1/profile` | Update profile information | Authenticated |
| PATCH | `/api/v1/profile/password` | Change account password | Authenticated |

---

# 2. User Management APIs (Admin)

Manage platform users.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/admin/users` | Get all users | Admin |
| GET | `/api/v1/admin/users/{id}` | Get user details | Admin |
| POST | `/api/v1/admin/users` | Create Worker/Admin account | Admin |
| PATCH | `/api/v1/admin/users/{id}` | Update user information | Admin |
| PATCH | `/api/v1/admin/users/{id}/status` | Activate/Deactivate user | Admin |
| DELETE | `/api/v1/admin/users/{id}` | Soft delete user | Admin |

---

# 3. Concern APIs

Manage waste-related complaints.

## Public APIs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/public/concerns` | Report a concern (Guest/Citizen) | Public |
| POST | `/api/v1/public/concerns/{id}/support` | Support/Upvote a concern | Public |

## Citizen APIs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/citizen/concerns` | View own concerns | Citizen |
| GET | `/api/v1/citizen/concerns/{id}` | View concern details | Citizen |
| PATCH | `/api/v1/citizen/concerns/{id}` | Edit pending concern | Citizen |
| DELETE | `/api/v1/citizen/concerns/{id}` | Delete pending concern | Citizen |

## Admin APIs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/admin/concerns` | View all concerns | Admin |
| GET | `/api/v1/admin/concerns/{id}` | View concern details | Admin |
| PATCH | `/api/v1/admin/concerns/{id}/status` | Update concern status | Admin |
| PATCH | `/api/v1/admin/concerns/{id}/priority` | Assign priority | Admin |

---

# 4. Assignment APIs

Manage assignment of concerns to workers.

## Admin APIs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/admin/assignments` | Assign concern to worker | Admin |
| GET | `/api/v1/admin/assignments` | View all assignments | Admin |
| GET | `/api/v1/admin/assignments/{id}` | View assignment details | Admin |
| PATCH | `/api/v1/admin/assignments/{id}` | Update assignment | Admin |
| DELETE | `/api/v1/admin/assignments/{id}` | Cancel assignment | Admin |

## Worker APIs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/worker/assignments` | View assigned work | Worker |
| PATCH | `/api/v1/worker/assignments/{id}/accept` | Accept assignment | Worker |
| PATCH | `/api/v1/worker/assignments/{id}/complete` | Complete assignment with proof image | Worker |
| PATCH | `/api/v1/worker/assignments/{id}/fail` | Report assignment failure | Worker |

---

# 5. Collection Route APIs

Manage daily collection routes.

## Admin APIs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/admin/routes` | Create collection route | Admin |
| GET | `/api/v1/admin/routes` | View all routes | Admin |
| GET | `/api/v1/admin/routes/{id}` | View route details | Admin |
| PATCH | `/api/v1/admin/routes/{id}` | Update route | Admin |
| DELETE | `/api/v1/admin/routes/{id}` | Delete route | Admin |

## Worker APIs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/worker/routes/today` | View today's assigned route | Worker |
| GET | `/api/v1/worker/routes/{id}/points` | Get collection points | Worker |

---

# 6. Collection Point APIs

Manage individual pickup locations.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| PATCH | `/api/v1/worker/points/{id}/complete` | Mark collection point as completed | Worker |
| PATCH | `/api/v1/worker/points/{id}/issue` | Report collection issue | Worker |

---

# 7. Suggestion APIs

Citizen suggestions for improving waste management.

## Citizen APIs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/citizen/suggestions` | Submit suggestion | Citizen |
| GET | `/api/v1/citizen/suggestions` | View own suggestions | Citizen |

## Admin APIs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/admin/suggestions` | View all suggestions | Admin |
| GET | `/api/v1/admin/suggestions/{id}` | View suggestion details | Admin |
| PATCH | `/api/v1/admin/suggestions/{id}` | Review suggestion | Admin |

---

# 8. Notification APIs

Manage user notifications.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/notifications` | Get notifications | Authenticated |
| PATCH | `/api/v1/notifications/{id}/read` | Mark notification as read | Authenticated |
| PATCH | `/api/v1/notifications/read-all` | Mark all notifications as read | Authenticated |

---

# 9. Dashboard APIs

Dashboard data for different user roles.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/dashboard/admin` | Admin dashboard | Admin |
| GET | `/api/v1/dashboard/worker` | Worker dashboard | Worker |
| GET | `/api/v1/dashboard/citizen` | Citizen dashboard | Citizen |

---

# 10. Analytics APIs

Administrative reports and analytics.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/analytics/overview` | System overview | Admin |
| GET | `/api/v1/analytics/wards` | Ward-wise analytics | Admin |
| GET | `/api/v1/analytics/workers` | Worker performance | Admin |
| GET | `/api/v1/reports/export` | Export reports (CSV/PDF) | Admin |

---

# 11. Waste Bin APIs

Manage public waste bins.

## Admin APIs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/admin/bins` | Add waste bin | Admin |
| GET | `/api/v1/admin/bins` | View all bins | Admin |
| GET | `/api/v1/admin/bins/{id}` | View bin details | Admin |
| PATCH | `/api/v1/admin/bins/{id}` | Update bin | Admin |
| DELETE | `/api/v1/admin/bins/{id}` | Remove bin | Admin |

## Public APIs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/public/bins` | View public bin locations | Public |

---

# 12. Map APIs

Provide geospatial data.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/maps/concerns` | GeoJSON of concerns | Admin |
| GET | `/api/v1/maps/routes` | GeoJSON of routes | Admin |
| GET | `/api/v1/maps/worker` | Assigned collection points | Worker |
| GET | `/api/v1/maps/bins` | Public waste bins | Public |

---

# 13. Chatbot API

AI-powered assistant.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/chatbot/chat` | Chat with UrbanPulse AI Assistant | Public |

---

# API Validation Standards

All APIs follow a unified response format.

## Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

## Error Response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {}
}
```

---

# Validation Rules

- JWT Authentication for protected endpoints.
- Role-Based Access Control (RBAC).
- UUID validation for all resource identifiers.
- Multipart image validation.
- File size and format validation.
- PostGIS coordinate validation.
- Pagination support.
- Standard HTTP status codes.
- Consistent JSON response structure.

---

# Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Resource Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |