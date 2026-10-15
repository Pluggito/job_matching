# Staff Guru — Test Users & Manual Testing Guide

This guide contains everything you need to test the entire Staff Guru platform end-to-end:
1. **The Job/Role Posting & Smart Matching**
2. **Shortlisting Candidates**
3. **The Handshake & Offer Acceptance**
4. **Payments (Agency Placement Fee & Errand Escrow via Paystack)**
5. **The Alabaru Errand Service (Post, Escrow, Claim, Proof, PIN Handoff & Payout)**

---

## ⚡ Quick Testing Setup Tip

> **Best Practice for Testing Multiple Roles:**
> * Open **Window 1 (Normal Browser)**: Log in as the **Employer** (`http://localhost:3000`).
> * Open **Window 2 (Incognito / Private Window)**: Log in as the **Worker / Runner** (`http://localhost:3000`).
> * Open **Window 3**: Log in as the **Admin** (`http://localhost:3001`).
>
> This allows you to perform actions as the Employer and immediately see them appear on the Worker's screen without logging in and out!

---

## 1. Test User Credentials Summary (All Passwords: `Password123!`)

### A. Employers
| Business / Name | Email | Password | Location | Primary Role & Active Request |
| :--- | :--- | :--- | :--- | :--- |
| **Zenith Garments Ltd** *(Adebayo Adewale)* | `employer.test@staffguru.com` | `Password123!` | Ikeja, Lagos | Hiring Request: **Master Tailor & Pattern Cutter** |
| **Apex Logistics** *(Chief Folake Balogun)* | `apex.employer@staffguru.com` | `Password123!` | Victoria Island, Lagos | Hiring Request: **Executive Corporate Driver** |

### B. Smart Match Candidates — Fashion, Tailoring & Textile
| Candidate | Email | Match Score | Primary Signals | Expected Badges / Reasons |
| :--- | :--- | :--- | :--- | :--- |
| **Chinedu Okafor** | `tailor.worker@staffguru.com` | **100% Match** | 6 yrs exp, Ikeja (same area), ₦140k (within budget), NIN Verified | Has all 3 required skills • Same area (Ikeja) • Highly experienced • Available now |
| **Amina Yusuf** | `amina.tailor@staffguru.com` | **71% Match** | 4 yrs exp, Surulere (same state), ₦140k, NIN Verified | Has 2 of 3 required skills • Same state (Lagos) • Available now • ⚠️ *Missing some required skills* |
| **Babatunde Adeleke** | `babatunde.tailor@staffguru.com` | **68% Match** | 3 yrs exp, Yaba (same state), ₦125k, NIN Pending | Has 2 of 3 required skills • Same state (Lagos) • Available now • ⚠️ *Missing some required skills* |
| **Blessing Okon** | `blessing.tailor@staffguru.com` | **32% Match** | 2 yrs exp (below min), ₦190k (above budget), NIN Pending | Same state (Lagos) • Available now • ⚠️ *Missing required skills* |

### C. Smart Match Candidates — Transport & Driving
| Candidate | Email | Match Score | Primary Signals | Expected Badges / Reasons |
| :--- | :--- | :--- | :--- | :--- |
| **Sunday Eze** | `sunday.driver@staffguru.com` | **100% Match** | 7 yrs exp, Victoria Island (same area), ₦140k, NIN Verified | Has all 3 required skills • Same area (VI) • Highly experienced • Available now |
| **Musa Danjuma** | `musa.driver@staffguru.com` | **82% Match** | 4 yrs exp, Ikeja (same state), ₦130k, NIN Verified | Has all 3 required skills • Same state (Lagos) • Meets experience • Available now |

### D. Other Verticals & Alabaru Errands
| Candidate | Email | Role / Vertical | Details |
| :--- | :--- | :--- | :--- |
| **Kemi Adeyemi** | `kemi.tech@staffguru.com` | **Technology & Digital** | React, TypeScript, Next.js, Figma, 4 yrs exp, Lekki Phase 1, Lagos |
| **Ibrahim Musa** | `runner.worker@staffguru.com` | **Alabaru Errand Runner** | Cleaning & Domestic Services, GTBank account on file, Open to on-demand errands |

### E. Super Admin
| Admin Name | Email | Password | Portal URL |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `pluggitoshfl5050@gmail.com` | `Password123!` | `http://localhost:3001` (Admin Portal) |
| **Founding Slot 2** | `superadmin2@staffguru.com` | `Password123!` | `http://localhost:3001` |
| **Founding Slot 3** | `superadmin3@staffguru.com` | `Password123!` | `http://localhost:3001` |

---

## 2. Onboarding Data Cheat Sheets

### User Profile A: The Employer
* **Signup URL:** `http://localhost:3000/signup`
* **Role Selection:** Select **"Employer / Hire Staff"**
* **Email:** `employer.test@staffguru.com`
* **Password:** `Password123!`
* **Employer Type:** `BUSINESS` (or `INDIVIDUAL`)

#### Step-by-Step Onboarding Form (`/onboarding`):
#### Step 1 — Personal & Business Details:
* **Full Name:** `Adebayo Adewale`
* **Business Name:** `Zenith Garments & Lifestyle Ltd`
* **Phone Number:** `+2348031234567`
* **Location:** `Ikeja, Lagos`

#### Step 2 — Hiring Requirements:
* **Type of staff needed:** `Fashion, Tailoring & Textile` *(or Master Tailor)*
* **Contract Type:** `Permanent`
* **Accommodation:** `No`
* **Compensation:** `Salary`
* **Amount (₦):** `150,000`
* *Click **"Complete Setup"*** ➔ Redirects straight to Employer Workspace (`/employer`).

---

### User Profile B: Worker #1 — Artisan / Tailor (For Job Matching & Handshake)
* **Signup URL:** `http://localhost:3000/signup`
* **Role Selection:** Select **"Worker / Find Work"**
* **Email:** `tailor.worker@staffguru.com`
* **Password:** `Password123!`

#### Step-by-Step Onboarding Form (`/onboarding`):
#### Step 1 — Personal Details:
* **Full Name:** `Chinedu Okafor`
* **Age:** `29`
* **Gender:** `Male`
* **Phone Number:** `+2348029876543`
* **Residential Address:** `14 Allen Avenue, Ikeja, Lagos`
* **Type of Job Needed:** Select **`Fashion, Tailoring & Textile`**
* **Experience (Yrs):** `5`
* **Expectation:** `Salary`
* **Amount (₦):** `120,000`
* **Do you need accommodation?:** `No`
* **Open to Alabaru Errands?:** Leave **UNCHECKED** *(this worker focuses on formal job placement)*
* *Click **"Next Step"***

#### Step 2 — Previous Employment History:
* **Name of Employer / Business:** `Vogue Apparel Nigeria`
* **Employer Phone:** `+2348051112233`
* **Job Role:** `Lead Pattern Cutter`
* **Duration:** `3 years`
* **Start Date:** `2021-01`
* **End Date:** `2024-01`
* **Reason for leaving:** `Relocation to Ikeja`
* *Click **"Next Step"***

#### Step 3 — Tailoring Assessment (Triggered automatically):
* **Can you use industrial sewing & weaving machines?:** `Yes`
* **Can you draft standard patterns or freehand?:** `Standard Patterns` *(or Both)*
* **Can you make corsets?:** `Yes`
* *(Optional: Work Samples - you can upload or skip)*
* *Click **"Next Step"***

#### Step 4 — Guarantors Verification:
* **Guarantor 1:**
  * **Full Name:** `Pastor Emmanuel Adeleke`
  * **Phone:** `+2348033334455`
  * **Occupation:** `Clergy / Education Consultant`
  * **Residential Address:** `22 Obafemi Awolowo Way, Ikeja, Lagos`
* **Guarantor 2:**
  * **Full Name:** `Mrs. Blessing Okon`
  * **Phone:** `+2348077778899`
  * **Occupation:** `Civil Servant`
  * **Residential Address:** `5 Kodesho Street, Ikeja, Lagos`
* *Click **"Complete Setup"*** ➔ Redirects to Worker Dashboard (`/dashboard`).

---

### User Profile C: Worker #2 — Errand Runner / Alabaru (For Errand Service & Direct Payouts)
* **Signup URL:** `http://localhost:3000/signup`
* **Role Selection:** Select **"Worker / Find Work"**
* **Email:** `runner.worker@staffguru.com`
* **Password:** `Password123!`

#### Step-by-Step Onboarding Form (`/onboarding`):
#### Step 1 — Personal Details:
* **Full Name:** `Ibrahim Musa`
* **Age:** `26`
* **Gender:** `Male`
* **Phone Number:** `+2348145556677`
* **Residential Address:** `Plot 8 Commercial Avenue, Ikeja, Lagos`
* **Type of Job Needed:** Select **`Transport & Driving`** *(or Cleaning & Domestic)*
* **Experience (Yrs):** `3`
* **Expectation:** `Salary`
* **Amount (₦):** `80,000`
* **Do you need accommodation?:** `No`
* **Open to Alabaru Errands?:** **CHECK THE BOX ✅** ("*I am open to running on-demand Alabaru errands*")
* *Click **"Next Step"***

#### Step 2 — Previous Employment History:
* **Name of Employer / Business:** `Speedy Logistics Express`
* **Employer Phone:** `+2348094445566`
* **Job Role:** `Dispatch Rider & Field Representative`
* **Duration:** `2 years`
* **Start Date:** `2022-03`
* **End Date:** `2024-05`
* **Reason for leaving:** `Seeking flexible field opportunities`
* *Click **"Next Step"***

#### Step 3 — Bank Details on File (CBN Offline Validated NUBAN):
> ⚠️ **IMPORTANT:** The platform enforces strict offline Central Bank of Nigeria (CBN) check-digit validation. Use the pre-tested valid NUBAN below:
* **Select Bank:** Choose **`Guaranty Trust Bank`** *(Bank Code: 058)*
* **Account Number:** `0123456785` *(Valid CBN check-digit 5)*
  *(Alternative valid test account: Choose **Zenith Bank (057)** with account `2001234567`)*
* **Account Name:** `Ibrahim Musa`
* *Notice the green verification badge confirming check digit validity.*
* *Click **"Next Step"***

#### Step 4 — Guarantors Verification:
* **Guarantor 1:**
  * **Full Name:** `Alhaji Sani Bello`
  * **Phone:** `+2348022223344`
  * **Occupation:** `Logistics Manager`
  * **Residential Address:** `12 Toyin Street, Ikeja, Lagos`
* **Guarantor 2:**
  * **Full Name:** `Kudirat Balogun`
  * **Phone:** `+2348066667788`
  * **Occupation:** `Community Leader`
  * **Residential Address:** `18 Oba Akran Avenue, Ikeja, Lagos`
* *Click **"Complete Setup"*** ➔ Redirects to Worker Dashboard (`/dashboard`).

---

## 3. End-to-End Test Scenarios Walkthrough

---

### Test Flow 1: Job / Role Posting & Smart Matching
**Goal:** Verify employer can post an open position and immediately see matching candidates ranked by the 100-point algorithm.

1. **Log in as Employer** (`employer.test@staffguru.com` / `Password123!`).
2. Go to **Post a Job** (`http://localhost:3000/employer/requests/new`).
3. Fill in the 3-step wizard:
   * **Step 1 (Basic Details):**
     * **Job Title:** `Master Tailor & Pattern Cutter`
     * **Category:** Select **`Fashion, Tailoring & Textile`**
     * **Description:** `Looking for an experienced master tailor capable of standard pattern drafting, industrial machine sewing, and handling premium bridal garments.`
   * **Step 2 (Requirements):**
     * **Required Skills:** `Tailoring, Pattern Making, Industrial Machine` *(comma separated)*
     * **Preferred Skills:** `Corset Making, Freehand Cutting`
     * **Min. Experience:** `3`
     * **Workers Needed:** `1`
   * **Step 3 (Location & Compensation):**
     * **Engagement Type:** `Onsite`
     * **State:** `Lagos`
     * **Area / LGA:** `Ikeja`
     * **Earliest Start Date:** Choose any date within the next 7 days.
     * **Budget Range:** Min `₦100,000` — Max `₦150,000`
4. Click **"Submit Request"**.
5. **Expected Result:**
   * You are redirected to `/employer/requests/[id]/matches`.
   * **Chinedu Okafor** appears with a **High Match Score** ring (90+ score)!
   * Reasons display matched category, matching skills, location match (Ikeja, Lagos), and availability.
   * Direct contact details (phone number) are masked for protection.

---

### Test Flow 2: Shortlisting & Handshake Agency Fee Payment
**Goal:** Verify employer can shortlist a candidate, review the placement fee guarantee modal explaining why we charge it, and pay the regulated agency placement fee (₦50,000) to unlock direct contact details and activate the 14-day replacement SLA.

1. On the **Smart Matches** page (`/employer/requests/[id]/matches`), find Chinedu's candidate card.
2. Click **"Shortlist Candidate"** (or "Send Offer").
   * The button transitions to **"Unlock Contact & Hire"**.
3. Click **"Unlock Contact & Hire"**.
   * An explanatory modal opens detailing **Why We Charge an Agency Placement Fee**:
     * **14-Day Replacement SLA Guarantee**: Free verified replacement if candidate underperforms or departs within 14 days.
     * **0% Deductions from Worker Wages**: Worker keeps 100% of their earned salary.
     * **Government NIN & Skill Vetting**: Pre-screened identity and background checks.
     * **Instant Contact Unlock**: Unmasked direct phone and WhatsApp access.
   * Shows breakdown: Placement Fee (₦50,000) + Paystack Processing Fee (₦850, 1.5% + ₦100) = **Total: ₦50,850**.
   * Click **"Pay ₦50,850 & Unlock Contact"**.
   * Paystack checkout initializes displaying **Pay NGN 50,850**.
   * In Paystack Test Mode, click **"Success"** or submit test card (`4084084084084081`, any CVV/future expiry).
4. After callback verification:
   * The green alert banner appears: **"Agency Handshake Fee Verified!"**
   * Handshake status moves to **"Handshake Confirmed — 14-day SLA active"**.
   * Click **"View Phone Number"** to view Chinedu's unmasked direct phone number (`+2348029876543`).

---

### Test Flow 3: The Handshake (Worker Side)
**Goal:** Verify the candidate receives the placement offer on their dashboard and can formally accept it.

1. In the **Worker (Incognito) Window**, log in as **Chinedu** (`tailor.worker@staffguru.com`).
2. Visit **Worker Dashboard** (`http://localhost:3000/dashboard`).
3. Under **Incoming Offers / Handshakes**, see the placement offer from *Zenith Garments & Lifestyle Ltd*.
4. Click **"Accept Offer"**.
   * Handshake status updates immediately to accepted.
   * Both employer and worker can now access the direct placement thread and contact each other.

---

### Test Flow 4: The Alabaru Errand Service (Post, Escrow, Claim, Proof, Handoff & Payout)
**Goal:** Verify the full lifecycle of an Alabaru on-demand task: employer budget input, outreach fee, escrow deposit, runner claiming, photo proof submission, 6-digit delivery PIN handoff, and escrow release.

#### Step 4.1: Employer Posts an Errand
1. In the **Employer Window**, go to `http://localhost:3000/employer/errands/new`.
2. Fill in the errand form:
   * **Errand Type:** Select **`Pickup & Secure Delivery`**
   * **Title:** `Pick up sample bridal lace from Balogun Market`
   * **Description:** `Collect 5 yards of royal blue French lace from Shop B12 and deliver to our Ikeja studio.`
   * **State:** `Lagos` | **Area:** `Ikeja`
   * **Pickup Address:** `Shop B12, Balogun Market, Lagos Island`
   * **Dropoff Address:** `14 Allen Avenue, Ikeja, Lagos`
   * **Deadline:** Select a time at least 3 hours from now.
   * **Required Proof Description:** `Take a clear timestamped photo of the sealed parcel before dispatch.`
   * **Errand Task Reward / Budget (₦):** Enter `8000` *(Must be $\ge$ ₦5,000 platform floor)*.
   * Notice the live checkout preview dynamically calculating:
     * *Errand Task Reward:* `₦8,000`
     * *Platform Outreach Fee:* `₦1,000` (100% refundable if unclaimed within 24h)
     * *Total Due at Checkout:* `₦9,000`
   * Check the **Prohibited Items guideline** acknowledgement checkbox.
3. Click **"Submit & Proceed to Escrow Payment"**.
4. **Expected Result:**
   * A 6-digit Delivery PIN is generated (e.g. `482910`).
   * You are redirected to `/employer/errands/[id]/checkout`.

#### Step 4.2: Employer Funds the Errand via Escrow
1. On the checkout page (`/employer/errands/[id]/checkout`), click **"Authorize Escrow Payment via Paystack"**.
2. Complete the Paystack test transaction.
3. Errand status updates from `pending_payment` to **`open`**.
4. The errand is now publicly dispatched on the Alabaru board.

#### Step 4.3: Errand Runner Claims the Errand
1. In the **Incognito Window**, log in as **Ibrahim** (`runner.worker@staffguru.com`).
2. Go to **Errands Board** (`http://localhost:3000/dashboard/errands`).
3. Click on the newly posted errand: *"Pick up sample bridal lace from Balogun Market"*.
4. Notice the details:
   * *Worker Payout:* `₦5,600` (70% of ₦8,000 reward; platform takes 30% commission).
   * Status: `Open for Claiming`.
5. Click **"Claim This Errand"**.
   * Errand status changes immediately to **`in_progress`**.

#### Step 4.4: Runner Submits Proof & Enters Delivery PIN
1. On the Errand Detail page (`/dashboard/errands/[id]`), the runner reaches the delivery dropoff.
2. Under **Submit Proof of Completion**, enter notes:
   * Notes: *"Lace picked up in pristine condition and safely handed over at Allen Avenue."*
   * Photo URL / Upload: Upload an image or paste a photo link.
3. Enter the **6-digit Delivery PIN** given by the employer (e.g. `482910`).
4. Click **"Submit Proof & Verify PIN"**.
   * The cryptographic HMAC verification validates the PIN instantly.
   * Errand status advances to **`proof_submitted`**.

#### Step 4.5: Employer Approves & Releases Funds
1. In the **Employer Window**, refresh the errand page (`/employer/errands/[id]`).
2. Review the submitted proof and photo.
3. Click **"Approve & Release Funds"**.
4. **Final Result:**
   * Errand status transitions to **`completed`**.
   * Financial ledger triggers automated payout of `₦5,600` to Ibrahim's verified GTBank account (`0123456785`).
   * Platform retains `₦2,400` commission + `₦1,000` outreach fee = `₦3,400` platform revenue.

---

### Test Flow 5: Admin Authentication, Super Admin Slots & Invite Access
**Goal:** Verify email/password admin login, the first 3 founding Super Admin seats, and invite-only staff enrollment.

#### Step 5.1: Login as Founding Super Admin #1
1. Open your browser and go to `http://localhost:3001` (`apps/admin`).
2. Notice the middleware automatically intercepts unauthenticated visits and redirects to `http://localhost:3001/login`.
3. In the **Sign In** tab, enter:
   * **Email:** `admin@staffguru.com`
   * **Password:** `AdminPassword123!`
4. Click **"Sign In to Console"**.
5. You are redirected to the Admin Dashboard (`http://localhost:3001`).
   * Top-right header displays: `System Super Admin` with the gold **SUPER ADMIN** badge.

#### Step 5.2: Enrolling Super Admin Slot #2 (Open Registration)
1. In the sidebar user menu (bottom-left), click **"Log out"**.
2. On `http://localhost:3001/login`, switch to the **"Create Account"** tab.
3. Notice the gold banner: **"⭐ Super Admin Early Access Active — Slot #2 of 3"**.
4. Fill in:
   * **Full Name:** `Amina Bello`
   * **Email:** `superadmin2@staffguru.com`
   * **Password:** `Password123!`
   * **Confirm Password:** `Password123!`
   *(Notice no invite code is needed!)*
5. Click **"Claim Super Admin Slot #2"**.
6. You are enrolled immediately with permanent Super Admin authority.

#### Step 5.3: Enrolling Super Admin Slot #3
1. Repeat registration with `superadmin3@staffguru.com`.
2. Claims the 3rd and final founding Super Admin slot.

#### Step 5.4: Generating an Invite Code (Invite-Only Era)
1. Once 3 Super Admins exist, open registration is locked! Any attempt to register without an invite will show:
   *"All 3 initial Super Admin slots have been claimed. A valid invite code is required to register."*
2. Log in as any Super Admin and navigate to **Team & Invites** (`http://localhost:3001/settings/team`).
3. Under **Generate Access Invite**, select Role: `Standard Administrator`, and click **"Generate Invite Code"**.
4. A 7-day cryptographic code appears (e.g. `SG-INV-A94F-7120`). Click **Copy**.
5. Log out and switch to `http://localhost:3001/login` -> **"Create Account"**.
6. Enter details for `staff.admin@staffguru.com` and paste the **Invite Access Code**.
7. Click **"Redeem Invite & Create Account"**.
8. The new administrator is registered and can access operational workflows.

---

## 4. Resetting Data Between Test Runs

If you ever wish to wipe all test submissions and start from a clean slate:
1. In your terminal, run:
   ```bash
   pnpm --filter=@repo/db exec tsx src/seed.ts
   ```
2. This resets the database, purges all test accounts and postings, and re-seeds the founding system admin (`admin@staffguru.com` / `AdminPassword123!`) in Super Admin Slot #1 with default platform settings.
