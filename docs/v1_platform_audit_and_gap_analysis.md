# STAFF GURU V1 — Platform Audit & Gap Analysis

**Date:** October 2026  
**Audited Target:** STAFF GURU Refined Concept (V1)  
**Codebase Repositories:** `@repo/db`, `@repo/shared`, `@staffguru/web`, `@staffguru/web-admin`, `@staffguru/socket`  

---

## 1. Executive Summary

| Category | Readiness | Status | Highlights |
| :--- | :---: | :--- | :--- |
| **Architectural Core** | **95%** | **Production Grade** | Turborepo monorepo, Next.js 15, PostgreSQL (Drizzle ORM), Standalone WebSockets server (`apps/socket`), Paystack payments engine. |
| **Errand Vertical (Alabaru)** | **95%** | **Production Grade** | 5 lifecycle stages, PIN delivery verification, proof uploads, escrow hold & release, real-time coordination chat. |
| **Recruitment & Smart Matching** | **80%** | **Functional with Gaps** | Multi-factor weighted matching algorithm, handshake offer flow, regulated placement fees, credential reveals. |
| **Admin & Compliance** | **90%** | **Production Grade** | Worker NIN verification queue, dispute arbitration, audit logging, ratings moderation, employer complaints desk. |
| **Overall V1 Readiness** | **85%** | **Near Ready** | Foundational architecture strictly follows the refined concept. Closing 5 specific UX/feature gaps will achieve 100% V1 launch readiness. |

---

## 2. Feature-by-Feature Audit Matrix

| # | Core Concept Feature | Status | Current Codebase Implementation | Gaps to Address for V1 Launch |
| :--- | :--- | :---: | :--- | :--- |
| **1** | **Worker profiles**<br>*(Skills, experience, location, availability, pay)* | **COMPLETED** | `workerProfiles` schema with `category`, `skills` (text array), `experienceYears`, `location`, `locationState`, `locationArea`, `availabilityStatus`, `availability`, `expectedPayKobo`, `profileData` (avatar, bio, samples). Editable via `/dashboard/profile/edit`. | Add structured fields for Trade Certificates / Licenses and verified Reference Contacts (name, phone, relationship). |
| **2** | **Employer profiles**<br>*(Business info & hiring requirements)* | **COMPLETED** | `employerProfiles` schema with `businessName`, `businessType`, `location`, `hiringNeeds`, `profileData` (RC number, about company, contact phone, logo). Editable via `/employer/profile/edit`. | Fully functional and aligned with requirements. |
| **3** | **Job & project posting**<br>*(Permanent, temporary, contract, freelance, task-based)* | **PARTIAL** | Multi-step role creation at `/employer/requests/new` and errand posting at `/employer/errands/new`. Captures title, category, skills, budget, location, and workers needed. | The role creation form only specifies `engagementType: "ONSITE" \| "REMOTE"`. Needs an explicit **Contract Type** selector: *Permanent*, *Temporary*, *Contract*, *Freelance*, *Task-based*. |
| **4** | **Smart matching**<br>*(Skills, location, experience, availability, pay)* | **COMPLETED** | Multi-factor matching engine (`@repo/shared/src/matching.ts`): Skills (40%), Location (20%), Experience (15%), Availability (10%), Budget Fit (10%), Trust/Verification (5%). | Working as intended. Top candidates viewable at `/employer/requests/[id]/matches`. |
| **5** | **Identity verification**<br>*(NIN-based with data privacy)* | **COMPLETED** | `ninVerificationStatus` (`PENDING`, `VERIFIED`, `REJECTED`), masked display (`maskNin`), and admin review queue (`apps/admin/app/workers`). Aligns with NDPR privacy requirements. | Fully operational. |
| **6** | **Portfolio & Credential verification**<br>*(Past work, certificates, references)* | **PARTIAL** | Portfolio sample uploads in worker profile; `portfolioItems` table in schema. | Add explicit UI sections for **Trade Certificates** and **References** so workers can upload licenses and admins can verify credentials. |
| **7** | **In-app communication**<br>*(Employer-worker messaging & interview coordination)* | **PARTIAL** | **Errands:** Live Socket.io coordination chat with typing indicators and read receipts.<br>**Admin:** Employer complaints / support desk (`/employer/messages`). | **Recruitment Roles:** Add direct in-app candidate messaging or an **"Interview Coordination"** modal on matched profiles so employers can schedule interviews without leaving Staff Guru. |
| **8** | **Ratings and reviews**<br>*(Structured feedback on completed engagements)* | **PARTIAL** | `ratings` table in DB with score, feedback, and moderation flag. Admin portal has `/admin/ratings` moderation queue. | Employers currently lack a frontend **"Rate & Review"** modal on completed errands or confirmed placements. |
| **9** | **Location matching**<br>*(Nearby talent discovery)* | **COMPLETED** | Matching engine calculates State, LGA/Area, and coordinate distance (Haversine formula). | Add a direct public/employer **Talent Directory** (`/find-talent` or `/employer/talent`) where employers can browse artisans directly by location. |
| **10** | **Notifications**<br>*(Job alerts & status updates)* | **COMPLETED** | In-app notification dispatcher (`createNotification`) + Web Push notifications (`sendPushToUser`), unread badges, and notifications view. | Operational across both Web and Admin applications. |
| **11** | **Recruitment dashboard**<br>*(Vacancies, applicants, shortlisted candidates)* | **PARTIAL** | Overview page (`/employer`) displays hiring requests and active role count. | Fix hardcoded `0` counters for *Curated Matches* and *Hired Workers*; add a **Saved Shortlist** review tab; fix currency symbol typo (`?` instead of `₦`). |
| **12** | **Admin / Verification dashboard**<br>*(Monitoring, moderation, disputes)* | **COMPLETED** | Comprehensive admin dashboard (`apps/admin`): Worker Verification (`/workers`), Employer Management (`/employers`), Errand Dispute Arbitration (`/errands`), Placements (`/placements`), Ratings (`/ratings`), Messages (`/messages`). | Fully operational. |

---

## 3. The 5 Priority Gaps to Complete for V1

### Gap 1: Employer "Rate & Review" Modal
* **Current State:** The database table `ratings` and the Admin moderation interface (`/ratings`) are complete. However, there is no UI modal on the web app for employers to submit ratings upon completing an errand or placement.
* **V1 Action Item:** Add a `SubmitRatingModal` triggered on:
  1. Completed Errands (`status === "completed"` on `/employer/errands/[id]`).
  2. Confirmed Placements (on `/employer/workers`).
  Allows employers to submit a 1–5 star rating and written feedback.

### Gap 2: Contract Type Selection on Job Posting Form
* **Current State:** `/employer/requests/new` only allows selecting `engagementType: "ONSITE" | "REMOTE"`.
* **V1 Action Item:** Add a dedicated **Contract Type** dropdown on Step 1 or 3:
  - *Full-time / Permanent*
  - *Temporary / Seasonal*
  - *Contract (Fixed Term)*
  - *Freelance / Project-based*
  - *Task-based (redirect to Errand)*

### Gap 3: In-App Interview Coordination on Matched Profiles
* **Current State:** Employers make a job offer and, once accepted, unlock contact details to call/email externally.
* **V1 Action Item:** Add an in-app **"Schedule Interview / Message Candidate"** modal on `/employer/requests/[id]/matches` allowing employers to:
  - Propose an interview date, time, and format (Phone, Video Call, or Onsite).
  - Exchange pre-screening questions before making a formal job offer.

### Gap 4: Direct Artisan Directory / Talent Search Page
* **Current State:** Employers can only view matched candidates after posting a job request.
* **V1 Action Item:** Add a direct talent search page (`/find-talent` or `/employer/talent`):
  - Filter tailors, electricians, mechanics, plumbers, and technicians by State, LGA, and skill tags.
  - View verified profile highlights, portfolio galleries, and verification badges.
  - One-click "Invite to Apply" or "Send Job Offer".

### Gap 5: Recruitment Dashboard Metric Fixes & Shortlist Tab
* **Current State:**
  - `/employer` has placeholder `0` for curated matches and hires.
  - Displays a currency typo: `Max Budget: {req.budgetMax}?` (literal question mark instead of `₦`).
* **V1 Action Item:**
  - Query real dynamic counts for curated matches and active hires.
  - Fix currency formatting using `formatNaira()`.
  - Add a "Saved Shortlist" tab allowing employers to view all bookmarked candidates across roles in one place.

---

## 4. Technical Architecture Review

```
monorepo (Turborepo)
├── apps/
│   ├── web/           # Next.js 15 PWA: Employer & Worker dash, public landing
│   ├── admin/         # Next.js 15: Admin operations, NIN verification, arbitration
│   └── socket/        # Standalone Socket.io Node microservice: live chat, typing, receipts
└── packages/
    ├── db/            # PostgreSQL Drizzle ORM schema, relations & seed data
    └── shared/        # Multi-factor matching engine, anti-circumvention filters, pricing
```

- **Docker Dependency:** Docker is **100% optional**. Local development runs natively on Node.js via `pnpm dev`. Cloud production deployments (Railway, Render, Fly.io, DigitalOcean) natively build Turborepo without requiring local Docker.
- **Data Protection Compliance:** NIN credentials are encrypted/masked and never exposed to employers or public profiles.
- **Anti-Circumvention Protection:** Real-time regex and leetspeak filters redact phone numbers, emails, handles, and 10-digit NUBAN account numbers in coordination chats until platform rules are fulfilled.
