# UrbanPulse API Documentation

Comprehensive REST API documentation for the UrbanPulse Smart Waste Management System.

---

## 1. System & Default APIs

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Root API health check and status | Public |

---

## 2. Authentication APIs

Manage authentication tokens, sessions, and credentials.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new citizen account | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user and return access & refresh JWT tokens | Public |
| `POST` | `/api/v1/auth/refresh` | Exchange a valid refresh token for a new access token | Authenticated |
| `POST` | `/api/v1/auth/logout` | Invalidate current user session | Authenticated |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user identity and role | Authenticated |

---

## 3. User Management APIs (Admin)

Manage platform users, roles, and account statuses.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/users` | List all system users | Admin |
| `POST` | `/api/v1/admin/users` | Create a new user (Admin / Worker) | Admin |
| `GET` | `/api/v1/admin/users/{user_id}` | Fetch detailed user profile by ID | Admin |
| `PATCH` | `/api/v1/admin/users/{user_id}` | Update user details | Admin |
| `DELETE` | `/api/v1/admin/users/{user_id}` | Soft delete a user account | Admin |
| `PATCH` | `/api/v1/admin/users/{user_id}/status` | Activate or deactivate user status | Admin |

---

## 4. Profile APIs

Manage the authenticated user's profile and credentials.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/profile` | Retrieve personal profile information | Authenticated |
| `PATCH` | `/api/v1/profile` | Update personal profile details | Authenticated |
| `PATCH` | `/api/v1/profile/password` | Change account password | Authenticated |

---

## 5. Concerns APIs

Manage citizen reports, issue verification, status transitions, and public community support.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/concerns/health` | Check concerns service status | Public |
| `GET` | `/api/v1/concerns/db-health` | Check concerns database connection status | Public |
| `GET` | `/api/v1/concerns/` | List concerns (with optional status & search filters) | Authenticated |
| `POST` | `/api/v1/concerns/` | Create a new concern report | Authenticated |
| `GET` | `/api/v1/concerns/{concern_id}` | Get concern details by ID | Authenticated |
| `PUT` | `/api/v1/concerns/{concern_id}` | Full update of concern data | Authenticated |
| `DELETE` | `/api/v1/concerns/{concern_id}` | Delete a concern | Admin / Creator |
| `PATCH` | `/api/v1/concerns/{concern_id}/status` | Update concern status (`pending`, `in_progress`, `resolved`) | Admin / Worker |
| `GET` | `/api/v1/concerns/{concern_id}/history` | Retrieve concern status audit log and history | Authenticated |
| `POST` | `/api/v1/concerns/{concern_id}/support` | Add community upvote/support to a concern | Authenticated |
| `DELETE` | `/api/v1/concerns/{concern_id}/support` | Remove previously added upvote/support | Authenticated |
| `GET` | `/api/v1/concerns/{concern_id}/support` | Fetch support count and voter details | Authenticated |

---

## 6. Concern Images APIs

Manage photo proof uploads for citizen reports and sanitation worker completions.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/concerns/{concern_id}/images` | Upload evidence image (Cloudinary-backed) | Citizen / Worker |
| `GET` | `/api/v1/concerns/{concern_id}/images` | List all evidence images attached to a concern | Authenticated |
| `DELETE` | `/api/v1/concerns/{concern_id}/images/{image_id}` | Delete an uploaded concern image | Citizen (Creator) |

> **RBAC Policy**: Administrators cannot upload evidence images directly to preserve objective audit trails. Evidence is restricted to reporting citizens or designated workers resolving the issue.

---

## 7. Suggestions APIs

Citizen suggestions and administrative review for municipal infrastructure improvements.

### Citizen
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/citizen/suggestions` | View all suggestions submitted by current user | Citizen |
| `POST` | `/api/v1/citizen/suggestions` | Submit a new suggestion | Citizen |

### Admin
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/suggestions` | Retrieve all submitted suggestions across wards | Admin |
| `GET` | `/api/v1/admin/suggestions/{suggestion_id}` | View details of a specific suggestion | Admin |
| `PATCH` | `/api/v1/admin/suggestions/{suggestion_id}` | Review, approve, or reject a suggestion | Admin |

---

## 8. Notifications APIs

Manage user notifications and read states.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notifications` | Get user notifications | Authenticated |
| `PATCH` | `/api/v1/notifications/read-all` | Mark all notifications as read | Authenticated |
| `PATCH` | `/api/v1/notifications/{notification_id}/read` | Mark a specific notification as read | Authenticated |

---

## 9. Dashboard APIs

Aggregated telemetry and operational dashboards by user role.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/admin` | Fetch comprehensive overview metrics for Admin | Admin |
| `GET` | `/api/v1/dashboard/worker` | Fetch daily assignments and routes for Worker | Worker |
| `GET` | `/api/v1/dashboard/citizen` | Fetch active citizen reports and personal impact | Citizen |

---

## 10. Assignments APIs

Manage dispatching citizen concerns to sanitation workers.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/assignments` | List all concern assignments | Authenticated / Admin / Worker |
| `POST` | `/api/v1/assignments` | Assign a concern to a worker | Admin |
| `GET` | `/api/v1/assignments/{assignment_id}` | View specific assignment details | Authenticated |
| `PATCH` | `/api/v1/assignments/{assignment_id}/status` | Update assignment lifecycle status | Worker / Admin |

---

## 11. Collection Routes APIs

Manage collection routes, scheduled shifts, and dispatch progress.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/collection-routes` | List all collection routes | Authenticated / Worker / Admin |
| `POST` | `/api/v1/collection-routes` | Create a new collection route | Admin |
| `GET` | `/api/v1/collection-routes/{route_id}` | Get route details | Authenticated |
| `PATCH` | `/api/v1/collection-routes/{route_id}` | Update route information | Admin |
| `DELETE` | `/api/v1/collection-routes/{route_id}` | Delete a collection route | Admin |
| `PATCH` | `/api/v1/collection-routes/{route_id}/status` | Update collection route operational status | Worker / Admin |

---

## 12. Collection Points APIs

Manage pickup points and stops mapped along collection routes.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/collection-points` | List all collection points | Authenticated |
| `POST` | `/api/v1/collection-points` | Add a new collection point | Admin |
| `GET` | `/api/v1/collection-points/route/{route_id}` | Get all collection stops for a route | Authenticated / Worker |
| `GET` | `/api/v1/collection-points/{point_id}` | Get specific collection point details | Authenticated |
| `PATCH` | `/api/v1/collection-points/{point_id}` | Update collection point coordinates or details | Admin |
| `DELETE` | `/api/v1/collection-points/{point_id}` | Remove a collection point | Admin |
| `PATCH` | `/api/v1/collection-points/{point_id}/collect` | Mark collection point as completed/collected | Worker |

---

## 13. Waste Bins APIs

Manage smart bins, fill-level telemetry, and deployment status.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/waste-bins` | List all waste bins | Authenticated / Admin |
| `POST` | `/api/v1/waste-bins` | Register a new waste bin | Admin |
| `GET` | `/api/v1/waste-bins/{waste_bin_id}` | Get specific waste bin details | Authenticated |
| `PATCH` | `/api/v1/waste-bins/{waste_bin_id}` | Update waste bin metadata | Admin |
| `PATCH` | `/api/v1/waste-bins/{waste_bin_id}/fill-level` | Update bin fill level percentage | Admin / Worker / IoT |
| `PATCH` | `/api/v1/waste-bins/{waste_bin_id}/activate` | Activate a waste bin | Admin |
| `PATCH` | `/api/v1/waste-bins/{waste_bin_id}/deactivate` | Deactivate a waste bin | Admin |

---

## 14. Maps APIs

Geospatial queries for mapping bins, concerns, and collection points.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/maps/nearby-bins` | Get nearby public waste bins based on coordinates | Authenticated / Public |
| `GET` | `/api/v1/maps/nearby-concerns` | Get nearby reported concerns | Authenticated |
| `GET` | `/api/v1/maps/nearby-collection-points` | Get nearby route collection points | Authenticated / Worker |

---

## 15. Analytics APIs

Operational breakdowns, SLA compliance metrics, and public impact telemetry.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/overview` | Platform-wide totals (users, workers, active issues) | Admin |
| `GET` | `/api/v1/analytics/workers` | Worker completion rates and performance rankings | Admin |
| `GET` | `/api/v1/analytics/concerns/status` | Concern counts grouped by resolution status | Admin |
| `GET` | `/api/v1/analytics/concerns/categories` | Concern counts categorized by issue type | Admin |
| `GET` | `/api/v1/analytics/concerns/priorities` | Concern counts grouped by priority level | Admin |
| `GET` | `/api/v1/analytics/routes/status` | Active vs completed route execution rates | Admin |
| `GET` | `/api/v1/analytics/collection-points/status` | Status metrics for collection pickup points | Admin |
| `GET` | `/api/v1/analytics/waste-bins/status` | Smart bin fill distributions and operational states | Admin |
| `GET` | `/api/v1/analytics/analytics/public-impact` | Public operational telemetry, SLA, and eco impact | Public |

---

## 16. Chatbot API

AI-powered assistant for citizen queries and waste management guidelines.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/chatbot/ask` | Query the UrbanPulse AI chatbot assistant | Public |

---
