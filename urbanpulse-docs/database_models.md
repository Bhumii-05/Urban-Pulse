# Database Models (UrbanPulse)

This document describes the database schema and relationships for the **UrbanPulse – Smart Urban Waste Management System**.

---

# 1. User

Stores information about all users of the platform.

## Fields

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| full_name | String | Full name of the user |
| email | String | Unique email address |
| phone | String | Contact number |
| password_hash | String | Hashed password |
| role | Enum | Admin, Worker, Citizen |
| address | Text | Residential address |
| ward | String | Ward/Zone |
| is_verified | Boolean | Account verification status |
| is_active | Boolean | Account status |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

## Relationships

- Reports many **Concerns**
- Uploads many **Concern Images**
- Supports many **Concerns**
- Receives many **Assignments** (Worker)
- Creates many **Assignments** (Admin)
- Assigned many **Collection Routes**
- Creates many **Collection Routes**
- Creates many **Suggestions**
- Reviews many **Suggestions** (Admin)
- Receives many **Notifications**
- Creates many **Concern History** records

---

# 2. Waste Bin

Represents every public waste bin managed by the municipality.

## Fields

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| bin_serial_number | String | Unique serial number |
| capacity_liters | Integer | Capacity of the bin |
| status | Enum | Empty, Half Full, Full, Overflowing, Damaged |
| ward | String | Ward where the bin is located |
| location | PostGIS Point | Geographic coordinates |
| last_emptied_at | DateTime | Last emptied timestamp |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

## Relationships

- One **Waste Bin** can have many **Concerns**

---

# 3. Concern

Represents a waste-related issue reported by a citizen or guest.

## Fields

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| title | String | Concern title |
| description | Text | Detailed description |
| category | Enum | Illegal Dumping, Overflowing Bin, Missed Collection, Public Bin Damage |
| status | Enum | Pending, Assigned, In Progress, Resolved, Rejected |
| priority | Enum | Low, Medium, High |
| reported_by | UUID | FK → User (Nullable for Guest) |
| waste_bin_id | UUID | FK → Waste Bin (Optional) |
| location | PostGIS Point | Geographic coordinates |
| address | Text | Human-readable address |
| resolved_at | DateTime | Resolution timestamp |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

## Relationships

- Belongs to one **User** (Reporter)
- May belong to one **Waste Bin**
- Has many **Concern Images**
- Has many **Concern Supports**
- Has many **Assignments**
- Has many **Concern History** records

---

# 4. Concern Image

Stores images uploaded for a concern.

## Fields

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| concern_id | UUID | FK → Concern |
| image_url | String | Cloudinary image URL |
| uploaded_by | UUID | FK → User (Nullable) |
| uploaded_at | DateTime | Upload timestamp |

## Relationships

- Belongs to one **Concern**
- Belongs to one **User**

---

# 5. Concern Support

Stores citizen support/upvotes for a concern.

## Fields

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| concern_id | UUID | FK → Concern |
| user_id | UUID | FK → User (Nullable for Guest) |
| guest_fingerprint | String | Guest identification |
| created_at | DateTime | Timestamp |

## Constraint

- One registered user can support the same concern only once.

## Relationships

- Belongs to one **Concern**
- Belongs to one **User**

---

# 6. Assignment

Represents work assigned by an administrator to a sanitation worker.

## Fields

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| concern_id | UUID | FK → Concern |
| worker_id | UUID | FK → User |
| assigned_by | UUID | FK → User (Admin) |
| status | Enum | Assigned, Accepted, Completed, Cancelled |
| remarks | Text | Additional remarks |
| completion_image | String | Proof image after completion |
| assigned_at | DateTime | Assignment timestamp |
| completed_at | DateTime | Completion timestamp |

## Relationships

- Belongs to one **Concern**
- Assigned to one **Worker**
- Created by one **Admin**

---

# 7. Concern History

Maintains an audit trail of every status change for a concern.

## Fields

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| concern_id | UUID | FK → Concern |
| old_status | Enum | Previous status |
| new_status | Enum | Updated status |
| changed_by | UUID | FK → User |
| changed_at | DateTime | Timestamp |

## Relationships

- Belongs to one **Concern**
- Updated by one **User** (Admin or Worker)

---

# 8. Collection Route

Represents a daily waste collection route assigned to a worker.

## Fields

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| worker_id | UUID | FK → User |
| created_by | UUID | FK → User (Admin) |
| date | Date | Route date |
| status | Enum | Pending, Active, Completed |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

## Relationships

- Assigned to one **Worker**
- Created by one **Admin**
- Has many **Collection Points**

---

# 9. Collection Point

Represents an individual pickup location within a collection route.

## Fields

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| route_id | UUID | FK → Collection Route |
| location_name | String | Pickup location name |
| locality | String | Area/locality |
| location | PostGIS Point | Geographic coordinates |
| sequence_no | Integer | Route order |
| status | Enum | Pending, Collected, Missed, Issue Reported |
| issue_reason | Enum | House Locked, Waste Not Ready, Road Blocked, Vehicle Issue, Other |
| created_by | UUID | FK → User |
| completed_at | DateTime | Completion timestamp |

## Relationships

- Belongs to one **Collection Route**

---

# 10. Suggestion

Stores suggestions submitted by citizens and reviewed by administrators.

## Fields

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| title | String | Suggestion title |
| description | Text | Suggestion details |
| suggested_by | UUID | FK → User (Citizen) |
| reviewed_by | UUID | FK → User (Admin, Nullable) |
| status | Enum | Pending, Under Review, Accepted, Rejected |
| admin_response | Text | Admin feedback |
| reviewed_at | DateTime | Review timestamp |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

## Relationships

- Belongs to one **Citizen** (`suggested_by`)
- May be reviewed by one **Admin** (`reviewed_by`)

---

# 11. Notification

Stores notifications sent to users.

## Fields

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| recipient_id | UUID | FK → User |
| title | String | Notification title |
| message | Text | Notification message |
| notification_type | Enum | Concern Assigned, Concern Resolved, Missed Collection, Route Assigned, Suggestion Accepted |
| reference_id | UUID | Optional reference to related entity |
| is_read | Boolean | Read status |
| created_at | DateTime | Creation timestamp |

## Relationships

- Belongs to one **User** (Recipient)

---

# Entity Relationship Summary

```text
User
├── Concerns
├── Concern Images
├── Concern Supports
├── Assignments (Worker)
├── Assignments (Admin)
├── Collection Routes
├── Suggestions (Submitted)
├── Suggestions (Reviewed)
├── Notifications
└── Concern History

Waste Bin
└── Concerns

Concern
├── Concern Images
├── Concern Supports
├── Assignments
└── Concern History

Collection Route
└── Collection Points

Assignment
├── Concern
├── Worker
└── Admin

Suggestion
├── Citizen (Suggested By)
└── Admin (Reviewed By)

Notification
└── User
```

---

# Relationship Cardinality

| Parent Entity | Child Entity | Relationship |
|---------------|-------------|--------------|
| User | Concern | One-to-Many |
| User | Concern Image | One-to-Many |
| User | Concern Support | One-to-Many |
| User | Assignment (Worker) | One-to-Many |
| User | Assignment (Admin) | One-to-Many |
| User | Collection Route | One-to-Many |
| User | Suggestion | One-to-Many |
| User | Notification | One-to-Many |
| User | Concern History | One-to-Many |
| Waste Bin | Concern | One-to-Many |
| Concern | Concern Image | One-to-Many |
| Concern | Concern Support | One-to-Many |
| Concern | Assignment | One-to-Many |
| Concern | Concern History | One-to-Many |
| Collection Route | Collection Point | One-to-Many |