# UrbanPulse Features

This document describes the major functional and architectural features of the UrbanPulse Smart Waste Management System.

---

# User Roles & Permissions

UrbanPulse implements strict Role-Based Access Control (RBAC) across three authenticated user roles: **Citizen**, **Sanitation Worker**, and **Administrator**.

---

# 1. Citizen

Registered citizens report neighborhood waste problems, propose infrastructure additions, and monitor municipal resolutions.

## Features

### Concern Reporting & Management
- Report waste concerns with category classification:
  - **Illegal Dumping**
  - **Overflowing Bin**
  - **Missed Pickup**
  - **Damaged Bin**
- Attach GPS location coordinates via interactive map pin selection or browser geolocation.
- Upload supporting evidence photos (stored securely via Cloudinary).
- Real-time duplicate detection:
  - Prevents filing identical reports for the same category within proximity of an active issue.
  - Automatically redirects citizens to **Upvote/Support** existing neighborhood concerns to raise administrative priority.
- Track status lifecycle of filed reports: `Pending` $\to$ `In Progress` $\to$ `Resolved`.
- Edit or delete concerns while they remain in `Pending` review status.
- Inspect full resolution details, including timestamped status updates.

### Suggestions
- Submit suggestions for municipal infrastructure:
  - Propose new public waste bin installations.
  - Request new recurring collection points.
  - General waste management improvements.
- Track administrative review status (`Pending`, `Under Review`, `Approved`, `Rejected`).
- View admin responses and status changes.

### Notifications & Activity Feed
- Real-time updates when:
  - A filed concern is assigned to a field worker.
  - A concern is marked `Resolved` by field staff.
  - An upvoted neighborhood concern status changes.
  - A submitted suggestion is reviewed or accepted.

### Citizen Dashboard
- Personal statistics overview: total reported, pending, and resolved concerns.
- List view of personal reports with live status badges.
- Suggestion tracking ledger.
- Notification inbox with read/unread tracking.

---

# 2. Sanitation Worker

Field sanitation workers manage daily collection schedules, navigate pickup points, and execute assigned problem-resolution work orders.

## Features

### Daily Collection Routes & Interactive Navigation
- Access daily assigned collection routes and ordered pickup stops.
- Interactive map interface rendering scheduled collection stops with distinct collection-state markers.
- Human-readable route stop labels (e.g., `"RouteName — Stop #X"`) paired with underlying coordinate preservation.
- Turn-by-turn navigation redirect using Google Maps navigation integration.

### Collection Point Execution
- Mark stops as **Collected** in sequence upon physical waste clearance.
- Report non-collection operational exceptions with categorized issue reasons:
  - **House Locked**
  - **Waste Not Ready**
  - **Road Blocked**
  - **Vehicle Issue**
  - **Other**
- Real-time map color synchronization indicating collected, pending, or blocked locations.

### Assigned Citizen Concerns & Resolution Evidence
- Dedicated **Assigned Citizen Concerns** work order view.
- Accept and initiate assigned work orders (`Assigned` $\to$ `In Progress`).
- Resolution proof pipeline:
  - Workers capture or upload an on-site completion image before closing out tasks.
  - Enforced backend RBAC ensures only the assigned worker or report creator can attach evidence images.
  - Closing the work order automatically syncs the concern to `Resolved` and notifies municipal administrators.

### Worker Dashboard
- Active collection route summary and progress metrics.
- Work order queue of assigned citizen concerns.
- Operational notification alerts.

---

# 3. Administrator

Administrators possess full operational oversight to triage reports, route trucks, dispatch personnel, and configure public assets.

## Features

### Analytics & System Telemetry
- Unified platform overview:
  - Total users, active sanitation workers, and field trucks.
  - Pending vs. resolved concerns ratio.
  - Completed route counts and active collection metrics.
- Real-time operational transparency telemetry and SLA resolution counters.

### User Management
- View and search user directory by name, email, or role (`Citizen`, `Worker`, `Admin`).
- Create and provision new **Sanitation Worker** and **Administrator** accounts.
- Update profile details and contact information.
- Activate or deactivate user platform access.
- Soft-delete decommissioned accounts.

### Concern Management
- View, search, and filter all citizen reports across categories and statuses (`Pending`, `In Progress`, `Resolved`).
- Detail inspection modal displaying reporter metadata, description, coordinates, and photographic evidence.
- Dual-image timeline: Displays original citizen report evidence alongside resolution proof photos uploaded by the completing sanitation worker.
- Priority assignment (`Low`, `Medium`, `High`).
- Worker dispatch: Assign concerns directly to active sanitation workers.
- Add to Route: Draft concern coordinates directly into active route construction to streamline pickup during scheduled runs.
- Direct manual status override to `Resolved`.

### Route & Collection Point Management
- Create daily collection routes and dispatch specific sanitation workers.
- Add collection points dynamically by providing latitude/longitude coordinates or dropping pins directly onto the interactive map.
- Map representation of citizen suggestions and reported concerns for contextual route planning.
- Manage, resequence, edit, or delete existing collection stops along active corridors.

### Suggestion Management
- Review community improvement proposals submitted by citizens.
- Filter proposals by type (new bins, collection stops, cleaning requests).
- Accept, reject, or mark suggestions under active municipal review.
- Direct coordinate import: Convert approved suggestion coordinates directly into map points or collection stops.

### Waste Bin Management
- Manage public smart bins and street containers.
- Register new waste bins with coordinate locations, capacity limits, and ward mapping.
- Update and monitor bin operational statuses: `Empty`, `Half Full`, `Full`, `Overflowing`, `Damaged`.
- Activate, deactivate, edit, or decommission public waste bin assets.

---

# Core Workflows

---

## 1. Concern Lifecycle & Deduplication Workflow

```text
Citizen Reports Concern
(Coordinates + Photo + Category)
           │
           ▼
 Proximity Duplicate Check
           │
 ┌─────────┴─────────┐
 │                   │
 ▼                   ▼
Duplicate Found?   No Match
 │                   │
 ▼                   ▼
Prompt to Support   Create Concern Record
Existing Concern    (Status: Pending)
(Increment Upvote)   │
                     ▼
             Admin Triages Report
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
   Dispatch Worker         Import to Route
   (Status: Assigned)      (Draft into Builder)
         │
         ▼
   Worker Accepts Task
   (Status: In Progress)
         │
         ▼
   Worker Uploads Evidence Photo
   & Completes Assignment
         │
         ▼
   Concern Marked "Resolved"
   (Admin Gallery Displays Worker Proof)