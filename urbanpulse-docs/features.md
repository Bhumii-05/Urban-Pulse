# UrbanPulse Features

This document describes the major functional features of the UrbanPulse Smart Waste Management System.

---

# User Roles & Permissions

UrbanPulse supports three authenticated roles along with public guest access. Each role has specific responsibilities and permissions.

---

# 1. Guest User (Public)

A guest can access the platform without creating an account.

## Features

- Report waste-related concerns anonymously.
- Upload images while reporting concerns.
- Share current location using browser GPS.
- View active concerns on the public map.
- Support (upvote) existing concerns.
- Interact with the AI chatbot.
- Browse general information about the platform.

---

# 2. Citizen

Registered citizens can access all Guest features along with additional services.

## Features

### Concern Management

- Report concerns linked to their account.
- Track reported concerns.
- Edit or delete concerns while they are pending.
- View complete concern history.

### Pin New Collection Point And Missed Collection Reporting

- Mark new pin location on map 
- Report missed door-to-door waste collection.
- Track the status of missed collection requests.


### Suggestions

- Submit suggestions for:
  - New public waste bins
  - New collection points
  - Waste management improvements
- View suggestion status.
- Read admin responses.

### Notifications

Receive notifications for:

- Concern assigned
- Concern resolved
- Suggestion reviewed
- Missed collection updates

### Dashboard

- View personal statistics.
- Total concerns submitted.
- Pending concerns.
- Resolved concerns.
- Suggestion history.

---

# 3. Sanitation Worker

Workers manage waste collection and assigned concerns.

## Features

### Daily Collection Routes

- View today's assigned route.
- View collection points in sequence.

### Collection Point Management

For every assigned location, workers can:

- Mark as Collected.
- Report collection issue.

Issue Reasons:

- House Locked
- Waste Not Ready
- Road Blocked
- Vehicle Issue
- Other

### Concern Assignments

Workers can:

- View assigned concerns.
- Accept assignments.
- Mark assignments as completed.
- Upload proof image after completion.

### Dashboard

- Assigned routes.
- Pending assignments.
- Completed assignments.
- Notifications.

---

# 4. Administrator

Administrators manage the entire system.

## User Management

- Create users.(opt)
- Manage workers.
- Verify accounts.(opt)
- Activate or deactivate users.(opt)

## Concern Management

- View all reported concerns.
- Assign priorities.
- Assign workers.
- Reject invalid reports.
- Monitor concern history.

## Route Management

- Create collection routes.
- Add collection points.
- Assign workers.
- Modify routes.
- Delete routes.

## Suggestion Management

- Review citizen suggestions.
- Accept suggestions.
- Reject suggestions.
- Provide feedback.

## Waste Bin Management

- Add public waste bins.
- Update bin information.
- Remove bins.
- Monitor bin status.

## Analytics Dashboard

View system statistics including:

- Total users
- Active workers
- Total concerns
- Pending concerns
- Resolved concerns
- Worker performance(opt)
- Ward-wise analytics(opt)

---

# Core Features

---

## 1. Concern Management

The platform allows citizens and guests to report waste-related issues.

### Concern Categories

- Illegal Dumping
- Overflowing Bin
- Missed Collection
- Public Bin Damage

### Concern Workflow

```text
Report Concern
      │
      ▼
Duplicate Check
      │
      ├── Existing Concern
      │       │
      │       ▼
      │   Support Existing Concern
      │
      ▼
Create New Concern
      │
      ▼
Pending
      │
      ▼
Admin Review
      │
      ▼
Assign Worker
      │
      ▼
Worker Completes Task
      │
      ▼
Resolved
```

---

## 2. Collection Route Management

Administrators create daily collection routes.

Each route contains multiple collection points.

Workers:

- View assigned route.
- Follow collection sequence.
- Update collection status.
- Report issues if collection fails.

---

## 3. Collection Point Tracking

Every collection point stores:

- Location
- Sequence Number
- Status
- Completion Time

Possible Statuses:

- Pending
- Collected
- Missed
- Issue Reported

---

## 4. Suggestion System

Citizens can suggest improvements.

Examples:

- Install new public waste bin.
- Create new collection point.
- Improve waste collection.
- Improve cleanliness.

Suggestions are reviewed by administrators before approval.

---

## 5. Waste Bin Management

Administrators manage public waste bins.

Each bin stores:

- Capacity
- Status
- Ward
- Location

Possible Status:

- Empty
- Half Full
- Full
- Overflowing
- Damaged

---

## 6. Assignment Management

Administrators assign reported concerns to workers.

Assignment lifecycle:

```text
Assigned
      │
      ▼
Accepted
      │
      ▼
Completed
```

Workers upload a completion image before marking the assignment as completed.

---

## 7. Notifications

The system automatically generates notifications.

### Citizens

- Concern assigned
- Concern resolved
- Suggestion reviewed
- Missed collection update

### Workers

- New assignment
- Route assigned
- Assignment completed

### Administrators

- New concern reported
- New suggestion submitted
- Assignment completed
- Collection issue reported

---

## 8. Dashboard

### Citizen Dashboard

- My Concerns
- My Suggestions
- Notifications
- Concern Status

### Worker Dashboard

- Today's Route
- Assigned Concerns
- Notifications
- Collection Progress

### Admin Dashboard

- User Statistics
- Concern Statistics
- Worker Performance
- Collection Routes
- Suggestions
- Notifications
- Waste Bin Overview

---

## 9. Interactive Maps

UrbanPulse uses openstreet Maps with role-based views.


### Citizen Map

- Report concern
- Add suggestion pin
- Track reported concerns

### Worker Map

- Assigned collection route
- Collection points
- Assigned concerns

### Admin Map

- All concerns
- Collection routes
- Waste bins
- Collection points
- Suggestions
- Analytics overlays

---

## 10. AI Chatbot

UrbanPulse includes an AI-powered chatbot.

### Capabilities

- Waste segregation guidance.
- Reporting assistance.
- Platform navigation.
- Frequently asked questions.
- Municipality information.
- Help users understand different concern categories.

The chatbot is implemented as an independent FastAPI microservice using the Gemini API.

---

# Non-Functional Features

- JWT Authentication
- Role-Based Access Control (RBAC)
- PostgreSQL with PostGIS
- FastAPI REST APIs
- SQLAlchemy ORM
- Alembic Database Migrations
- Cloudinary Image Storage
- Responsive React Frontend
- Input Validation
- Secure Password Hashing
- API Documentation
- Modular Architecture
- Scalable Service Layer
- Error Handling and Logging

---

# Future Enhancements

- Route optimization using shortest-path algorithms.
- Predictive waste collection analytics.
- IoT-enabled smart waste bins.
- SMS and Email notifications.
- Offline support for workers.
- Mobile application.
- AI-based waste image classification.
- QR-code enabled waste bins.