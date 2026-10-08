# 💊 MediMate AI — Agentic AI Health Companion

<div align="center">

### From Reminder to Response — Intelligent Medication Adherence Support

**A production-deployed, safety-first Agentic AI healthcare platform for medication scheduling, autonomous reminders, adherence analytics, AI-assisted support, and consent-based caregiver escalation.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-MediMate%20AI-0A66C2?style=for-the-badge&logo=vercel&logoColor=white)](https://medimate-ai-two.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Shibaji157/MediMate-AI)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![SDG 3](https://img.shields.io/badge/SDG%203-Good%20Health%20%26%20Well--Being-4C9F38?style=flat-square)](https://sdgs.un.org/goals/goal3)

</div>

---

## 📚 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [What MediMate AI Does](#-what-medimate-ai-does)
- [Why It Is Agentic](#-why-medimate-ai-is-agentic)
- [How It Works](#-how-it-works)
- [Core Features](#-core-features)
- [Medication State Logic](#-medication-state-logic)
- [Adherence Analytics](#-adherence-analytics)
- [Caregiver Support](#-caregiver-support)
- [AI Companion & Safety](#-ai-companion--safety)
- [Feedback & Continuous Improvement](#-feedback--continuous-improvement)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Database Design](#-database-design)
- [Application Routes](#-application-routes)
- [API Routes](#-api-routes)
- [Security & Privacy](#-security--privacy)
- [Production Automation](#-production-automation)
- [Environment Variables](#-environment-variables)
- [Run Locally](#-run-locally)
- [Testing & Validation](#-testing--validation)
- [Current MVP Status](#-current-mvp-status)
- [Future Roadmap](#-future-roadmap)
- [Real-World Impact](#-real-world-impact)
- [Developer Information](#-developer-information)
- [Project Context](#-project-context)
- [Important Links](#-important-links)

---

# 📌 Project Overview

**MediMate AI** is a real-world **Agentic AI Health Companion** built to improve medication adherence.

The project focuses on a practical healthcare problem:

> **People often forget medication, take it late, skip it, or fail to maintain a reliable record of what actually happened.**

Most reminder applications stop after sounding an alarm. MediMate AI continues the workflow after the reminder by tracking the user's response, identifying overdue or missed doses, calculating adherence, presenting analytics, and—when the user has explicitly authorized it—escalating missed-dose events to a trusted caregiver.

MediMate AI is currently deployed as a **live production MVP**.

### 🌐 Live Application
https://medimate-ai-two.vercel.app

### 💻 GitHub Repository
https://github.com/Shibaji157/MediMate-AI

---

# 🚨 Problem Statement

Medication adherence can become difficult when users rely only on memory, generic alarms, handwritten schedules, or fragmented applications.

Common problems include:

- forgetting scheduled medication,
- taking medication late,
- skipping doses,
- losing track of whether a medication was already taken,
- poor visibility into adherence patterns,
- lack of timely caregiver awareness,
- repeated manual checking,
- disconnected medication records.

Traditional alarms usually cannot answer:

- Was the medication actually taken?
- Was it intentionally skipped?
- Is the dose still pending?
- Did the dose become overdue?
- Was the dose eventually missed?
- Is adherence improving or getting worse?
- Should an authorized caregiver be informed?

MediMate AI was created to close this gap.

---

# 💡 What MediMate AI Does

MediMate AI provides a complete medication adherence workflow.

Users can:

- create an account,
- verify email,
- sign in securely,
- add medications,
- define medication schedules,
- configure dose times,
- choose days of the week,
- receive medication reminders,
- mark doses as Taken,
- mark doses as Skipped,
- automatically detect missed doses,
- view notification history,
- review adherence analytics,
- interact with a context-aware AI Companion,
- invite trusted caregivers,
- create consent-based caregiver relationships,
- trigger missed-dose escalation to authorized caregivers,
- manage profile and reminder settings,
- submit feedback for continuous improvement,
- securely delete medications.

The backend can also operate autonomously through scheduled production jobs.

---

# 🤖 Why MediMate AI Is Agentic

MediMate AI is designed around **goal-directed autonomous behavior**.

It does not require the user to manually request every reminder check.

### Perceive
The system reads:

- medication schedules,
- dose times,
- dose events,
- notification states,
- caregiver relationships,
- user settings.

### Reason
The system determines whether a scheduled dose is:

- Upcoming,
- Due,
- Overdue,
- Missed,
- Taken,
- Skipped,
- Pending.

### Act
The system can automatically:

- create reminders,
- create notifications,
- synchronize missed doses,
- update adherence state,
- trigger caregiver escalation when authorized.

### Observe
The system checks whether the patient responded.

### Escalate
The system can notify a trusted caregiver when a qualifying missed-dose event occurs and the required relationship/consent is active.

### Improve
Adherence history and user feedback provide a foundation for future product improvements.

---

# 🔄 How It Works

```text
Patient creates medication
        ↓
Creates recurring schedule
        ↓
Autonomous engine monitors schedule
        ↓
Upcoming reminder
        ↓
Scheduled time reached
        ↓
Due reminder
        ↓
Patient responds?
   ↙                 ↘
Taken               Skip
   ↓                  ↓
Dose event recorded
        ↓
Adherence recalculated
        ↓
No response?
        ↓
Overdue
        ↓
Tracking window expires
        ↓
Missed
        ↓
Check caregiver relationship + consent
        ↓
Authorized caregiver escalation
        ↓
Analytics + AI Companion + history
```

The core product loop is:

> **Schedule → Monitor → Remind → Record → Analyze → Escalate**

---

# ✨ Core Features

## 🔐 1. Secure Authentication

MediMate AI uses Supabase Authentication.

Implemented functionality includes:

- User signup
- Email verification
- Login
- Patient role
- Caregiver role
- Secure sessions
- Protected routes
- Automatic profile creation
- Sign out

---

## 💊 2. Medication Management

Users can create and manage medication records.

Supported information includes:

- medication name,
- strength,
- form,
- instructions,
- start date,
- end date,
- active status.

Users can also securely delete medications.

---

## 🗓️ 3. Medication Scheduling

Medication schedules support:

- dose time,
- dose amount,
- selected weekdays,
- recurring routines,
- active status,
- reminder-enabled state.

---

## ✅ 4. Dose Tracking

Today's scheduled doses appear on the patient dashboard.

Users can record:

### Mark Taken
Records that the scheduled medication was taken.

### Skip
Records that the user intentionally skipped that dose.

Dose events are stored for adherence analysis.

---

# ⏰ Medication State Logic

| Status | Meaning |
|---|---|
| **Upcoming** | Scheduled dose is approaching |
| **Due** | Scheduled medication time has arrived |
| **Overdue** | Dose is past due but still inside the tracking window |
| **Missed** | Tracking window expired without Taken or Skip |
| **Taken** | User recorded the dose as taken |
| **Skipped** | User intentionally skipped the dose |
| **Pending** | Dose is still awaiting action |

---

## 🔔 5. Autonomous Reminder Engine

The reminder engine automatically evaluates medication schedules.

Typical flow:

```text
Scheduled medication
        ↓
Upcoming reminder
        ↓
Due reminder
        ↓
No response
        ↓
Overdue reminder
        ↓
No response within tracking window
        ↓
Missed-dose state
```

Production automation means the reminder engine does not depend on the browser remaining open.

---

## 🔔 6. Notification Center

MediMate provides a dedicated notification center.

Supported notification types include:

- Upcoming
- Due
- Overdue
- Missed
- System

Users can:

- see unread notification count,
- review notification history,
- mark notifications as read,
- delete notifications.

---

# 📊 Adherence Analytics

MediMate converts dose activity into adherence insights.

The current analytics module includes:

- Overall adherence
- Total scheduled doses
- Taken doses
- Missed doses
- Skipped doses
- Pending doses
- 7-day adherence trend
- Daily adherence breakdown
- Dose outcome charts
- Medication-level performance

The analytics are calculated from stored medication schedules and real recorded dose events.

---

# 👨‍👩‍👧 Caregiver Support

MediMate includes **consent-based caregiver collaboration**.

A patient can invite a trusted caregiver by email.

The caregiver relationship is not activated automatically.

```text
Patient sends invitation
        ↓
Caregiver reviews invitation
        ↓
Caregiver accepts
        ↓
Relationship becomes active
        ↓
Authorized adherence support enabled
```

The relationship can later be revoked or left.

---

# 🚨 Autonomous Caregiver Escalation

If MediMate detects a qualifying missed-dose event, it can evaluate caregiver escalation.

```text
Missed dose detected
        ↓
Check caregiver relationship
        ↓
Relationship active?
        ↓
Required consent enabled?
        ↓
Create caregiver escalation
        ↓
Authorized caregiver receives alert
```

Duplicate-protection logic prevents the same event from producing repeated escalations.

---

# 🤖 AI Companion & Safety

The **MediMate Companion** provides context-aware adherence support.

It can work with information such as:

- today's medication schedule,
- medication status,
- adherence activity,
- missed-dose context,
- medication routine.

The Companion is intended to support organization and adherence awareness—not clinical decision-making.

## 🛡️ Safety Guardrails

MediMate AI does **not**:

- diagnose diseases,
- prescribe medication,
- change medication dosage,
- tell users to double a missed dose,
- determine whether a delayed medication should be taken,
- replace a doctor,
- replace a pharmacist,
- provide emergency medical treatment.

For clinical decisions, users should follow:

- prescription instructions,
- medication labels,
- pharmacist guidance,
- qualified healthcare professionals.

---

# ⚙️ Settings

The Settings module supports:

- Full name
- Timezone
- Medication reminder preference

These settings are stored in the user's profile.

---

# 💬 Feedback & Continuous Improvement

MediMate includes a built-in feedback system.

Users can provide:

- 1–5 star rating,
- feedback category,
- written feedback.

Current categories include:

- General Experience
- Medication Reminders
- MediMate Companion
- Caregiver Support
- Adherence Analytics

This gives the product a structured continuous-improvement loop.

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │        USER          │
                         │ Patient / Caregiver  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Next.js App     │
                         │ React + TypeScript   │
                         │ Tailwind CSS         │
                         └──────────┬───────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
    ┌────────────────┐     ┌────────────────┐     ┌─────────────────┐
    │ Medication     │     │ MediMate AI    │     │ Caregiver       │
    │ Management     │     │ Companion      │     │ Support         │
    └───────┬────────┘     └───────┬────────┘     └────────┬────────┘
            │                      │                       │
            └──────────────────────┼───────────────────────┘
                                   │
                                   ▼
                         ┌──────────────────────┐
                         │      Supabase        │
                         │ Auth + PostgreSQL    │
                         │ Row Level Security   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Supabase Cron     │
                         │ Autonomous Scheduler │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │ Autonomous Medication Engine │
                    │ Reminder Generation           │
                    │ Missed-Dose Detection         │
                    │ Caregiver Escalation          │
                    └───────────────────────────────┘
```

---

# 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 |
| **Frontend** | React |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Backend Platform** | Supabase |
| **Database** | PostgreSQL |
| **Authentication** | Supabase Auth |
| **Database Security** | Row Level Security |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Production Hosting** | Vercel |
| **Scheduled Automation** | Supabase Cron |
| **Source Control** | Git |
| **Repository Hosting** | GitHub |

---

# 🗃️ Database Design

## `profiles`

Stores:

- user ID,
- full name,
- role,
- timezone,
- reminder preference.

## `medications`

Stores:

- medication owner,
- name,
- strength,
- form,
- instructions,
- start date,
- end date,
- active state.

## `medication_schedules`

Stores:

- medication reference,
- user reference,
- dose time,
- dose amount,
- days of week,
- reminder configuration,
- active state.

## `dose_events`

Stores recorded adherence events including:

- Taken
- Skipped
- Missed

## `notifications`

Stores:

- reminder type,
- title,
- message,
- scheduled time,
- read/unread state.

## Caregiver Data

Stores:

- invitations,
- active relationships,
- consent state,
- escalation events.

## `feedback`

Stores:

- user,
- category,
- rating,
- feedback message,
- timestamp.

---

# 🧭 Application Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/signup` | Create account |
| `/login` | User login |
| `/dashboard` | Patient dashboard |
| `/medications` | Medication management |
| `/medications/new` | Add medication |
| `/notifications` | Notification center |
| `/analytics` | Adherence analytics |
| `/companion` | MediMate Companion |
| `/caregiver` | Caregiver support |
| `/feedback` | User feedback |
| `/settings` | User preferences |

---

# 🔌 API Routes

| Endpoint | Purpose |
|---|---|
| `/api/medications` | Medication operations |
| `/api/medications/[id]` | Secure medication deletion |
| `/api/doses` | Dose-event operations |
| `/api/doses/sync` | Dose synchronization |
| `/api/reminders/sync` | Reminder synchronization |
| `/api/cron/reminders` | Autonomous production processing |
| `/api/notifications/[id]` | Notification update/delete |
| `/api/caregiver/invitations` | Caregiver invitation management |
| `/api/caregiver/relationships/[id]` | Caregiver relationship management |
| `/api/companion` | AI Companion backend |
| `/api/feedback` | Feedback submission |
| `/api/settings` | User setting updates |

---

# 🔒 Security & Privacy

Security is built into the application architecture.

## Row Level Security

Supabase **Row Level Security (RLS)** restricts records to authorized users.

Examples:

- users access only their medications,
- users access only their notifications,
- users update only their profiles,
- caregiver data is limited to authorized relationships.

## Server-Only Credentials

Sensitive values remain server-side.

Examples:

```text
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
```

These values must never be committed to GitHub.

## Protected Cron Endpoint

The production cron endpoint requires:

```text
x-cron-secret
```

Unauthorized requests are rejected.

## Consent-Based Sharing

Caregiver access requires an explicit relationship rather than automatic family access.

---

# ⚡ Production Automation

The backend is designed to continue running even when:

- the browser is closed,
- the user's laptop is off,
- VS Code is not running,
- no user is actively using the application.

Supabase Cron periodically invokes:

```text
POST /api/cron/reminders
```

The autonomous process can:

- scan active medication schedules,
- synchronize missed doses,
- generate reminders,
- prevent duplicate reminders,
- identify qualifying missed-dose events,
- create caregiver escalations.

---

# 🔐 Environment Variables

The project uses environment variables such as:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
```

> ⚠️ Never commit actual secret values to GitHub.

`.env.local` must remain ignored by Git.

---

# 💻 Run Locally

## 1. Clone the repository

```bash
git clone https://github.com/Shibaji157/MediMate-AI.git
```

## 2. Enter the project

```bash
cd MediMate-AI
```

## 3. Install dependencies

```bash
npm install
```

## 4. Create `.env.local`

Add the required Supabase and server environment variables.

## 5. Start development

```bash
npm run dev
```

## 6. Open

```text
http://localhost:3000
```

---

# 🏗️ Production Build

Run:

```bash
npm run build
```

The current production MVP has successfully passed:

- Next.js production compilation,
- TypeScript checking,
- page-data collection,
- static-page generation.

---

# 🚀 Production Deployment

MediMate AI is hosted on **Vercel**.

### 🌐 Live Application

https://medimate-ai-two.vercel.app

Production flow:

```text
GitHub
   ↓
Vercel Deployment
   ↓
Next.js Application
   ↓
Supabase
   ↓
PostgreSQL + RLS
   ↓
Supabase Cron
   ↓
Autonomous Reminder Engine
```

---

# 🧪 Testing & Validation

The project has been tested across the main end-to-end workflows.

Validated functionality includes:

✅ Signup  
✅ Email verification  
✅ Login  
✅ Patient dashboard  
✅ Add medication  
✅ Medication scheduling  
✅ Delete medication  
✅ Mark Taken  
✅ Skip dose  
✅ Missed-dose detection  
✅ Upcoming reminders  
✅ Due reminders  
✅ Overdue reminders  
✅ Notification center  
✅ Mark notification as read  
✅ Delete notification  
✅ Adherence analytics  
✅ Caregiver invitation  
✅ Caregiver acceptance  
✅ Active caregiver relationship  
✅ Missed-dose caregiver escalation  
✅ Duplicate escalation protection  
✅ MediMate Companion  
✅ Settings  
✅ Feedback submission  
✅ Production Vercel deployment  
✅ Production Cron execution  

---

# 📈 Current MVP Status

| Capability | Status |
|---|---|
| Authentication | ✅ Complete |
| Email Verification | ✅ Complete |
| Patient Dashboard | ✅ Complete |
| Medication CRUD | ✅ Complete |
| Medication Scheduling | ✅ Complete |
| Dose Tracking | ✅ Complete |
| Missed-Dose Detection | ✅ Complete |
| Autonomous Reminders | ✅ Complete |
| Notification Center | ✅ Complete |
| Adherence Analytics | ✅ Complete |
| AI Companion | ✅ Complete |
| Caregiver Invitations | ✅ Complete |
| Consent-Based Relationship | ✅ Complete |
| Caregiver Escalation | ✅ Complete |
| Duplicate Protection | ✅ Complete |
| Settings | ✅ Complete |
| Feedback System | ✅ Complete |
| Supabase Cron | ✅ Production |
| GitHub Repository | ✅ Public |
| Vercel Deployment | ✅ Live |

---

# 🌍 SDG Alignment

## SDG 3 — Good Health & Well-Being

MediMate AI supports SDG 3 by promoting:

- medication routine awareness,
- adherence tracking,
- earlier missed-dose visibility,
- patient engagement,
- caregiver coordination,
- responsible use of AI in healthcare.

---

# 🎯 Real-World Impact

## For Patients

- Better medication organization
- Improved routine visibility
- Clearer adherence history
- Easier medication tracking

## For Caregivers

- Permission-based visibility
- Earlier awareness of missed doses
- Structured adherence support

## For Healthcare Programs

The platform can evolve into:

- chronic-care support,
- medication adherence monitoring,
- patient-engagement infrastructure,
- community-health tools.

---

# 🗺️ Future Roadmap

## Phase 2 — Engagement

- Web push notifications
- Email reminders
- Installable Progressive Web App
- Multilingual support
- Advanced reminder preferences
- 30-day adherence analytics

## Phase 3 — Intelligent Assistance

- Prescription scanning
- Refill reminders
- Medication inventory tracking
- Personalized adherence insights
- Advanced AI Companion
- Predictive adherence-risk indicators

## Phase 4 — Healthcare Ecosystem

- Doctor dashboard
- Clinic portal
- Pharmacy integration
- Hospital integration
- FHIR interoperability
- EHR integration
- Chronic-care programs
- Public-health partnerships

---

# 👨‍💻 Developer Information

<div align="center">

## **Shibaji Biswas**

### Student — Chandigarh University

**Artificial Intelligence / Machine Learning**

Interested in:

**Artificial Intelligence • Machine Learning • Agentic AI • Data Analytics • Full-Stack Development • Digital Health**

📧 **Email**  
[shibajibiswas.cse@gmail.com](mailto:shibajibiswas.cse@gmail.com)

💻 **GitHub**  
https://github.com/Shibaji157

🌐 **Live MediMate AI**  
https://medimate-ai-two.vercel.app

</div>

---

# 🏫 Project Information

| Detail | Information |
|---|---|
| **Project Name** | MediMate AI |
| **Full Name** | MediMate AI — Agentic AI Health Companion |
| **Developer** | Shibaji Biswas |
| **University** | Chandigarh University |
| **Domain** | Artificial Intelligence + Digital Health |
| **Theme** | Good Health |
| **SDG** | SDG 3 — Good Health & Well-Being |
| **Project Type** | Agentic AI Healthcare Application |
| **Frontend** | Next.js + React + TypeScript |
| **Backend** | Supabase |
| **Database** | PostgreSQL |
| **Automation** | Supabase Cron |
| **Deployment** | Vercel |
| **Status** | Production MVP |

---

# 📜 Project Context

MediMate AI was developed for the:

## **IBM Bharat Cares Project**

### Theme
**Good Health**

### Core Problem
**Missed Medication & Poor Medication Adherence**

### Proposed Solution
**Agentic AI Health Companion**

### SDG
**SDG 3 — Good Health & Well-Being**

---

# 🔗 Important Links

### 🌐 Live Application
https://medimate-ai-two.vercel.app

### 💻 GitHub Repository
https://github.com/Shibaji157/MediMate-AI

### 👨‍💻 Developer GitHub
https://github.com/Shibaji157

### 📧 Contact
shibajibiswas.cse@gmail.com

---

# ⭐ Why MediMate AI Is Different

MediMate AI combines:

✅ Medication scheduling  
✅ Autonomous reminder generation  
✅ Real dose-state tracking  
✅ Missed-dose detection  
✅ Adherence analytics  
✅ Context-aware AI support  
✅ Consent-based caregiver relationships  
✅ Autonomous caregiver escalation  
✅ Duplicate escalation protection  
✅ Healthcare AI safety guardrails  
✅ Secure Row Level Security  
✅ Production Cron automation  
✅ Continuous user feedback  
✅ Real cloud deployment  

Most importantly:

> **MediMate AI is a working deployed product—not only a prototype, concept, or presentation.**

---

<div align="center">

# 💊 MediMate AI

## **From Reminder to Response.**

### Intelligent • Autonomous • Secure • Privacy-Conscious • Safety-First

Developed by

## **Shibaji Biswas**

**Chandigarh University**

📧 **shibajibiswas.cse@gmail.com**

🌐 **https://medimate-ai-two.vercel.app**

💻 **https://github.com/Shibaji157/MediMate-AI**

---

### Built for Better Medication Adherence.

⭐ If you find MediMate AI useful, consider starring the repository.

</div>
