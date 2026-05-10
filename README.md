# 🌍 Traveloop

Traveloop is a modern full-stack travel planning application built for hackathons and collaborative trip management.

The platform helps users:

* Create personalized travel itineraries
* Plan multi-city journeys
* Manage travel budgets
* Organize activities and trip notes
* Upload trip/profile images
* Explore destinations efficiently

Built with a local-first architecture using PostgreSQL and Prisma.

---

# 🚀 Tech Stack

## Frontend

* Next.js
* React
* Tailwind CSS

## Backend

* Next.js API Routes
* Prisma ORM

## Database

* PostgreSQL

## Authentication

* bcryptjs

## File Uploads

* Local Storage (`public/uploads`)

---

# ✨ Features

## Authentication

* User Registration
* User Login
* Password Hashing
* Profile Image Upload

## Trip Management

* Create Trips
* Multi-City Itinerary Planning
* Add Activities
* Budget Tracking
* Travel Notes
* Packing Checklist

## UI/UX

* Responsive Design
* Modern Dark Theme
* Mobile Friendly
* Clean Navigation

---

# 📂 Project Structure

```txt
src/
│
├── app/
│   ├── api/
│   ├── login/
│   ├── register/
│   └── page.jsx
│
├── components/
│
├── lib/
│   └── prisma.js
│
└── generated/

prisma/
│
├── migrations/
└── schema.prisma
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone <repository-url>
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Setup PostgreSQL

Create a PostgreSQL database:

```sql
CREATE DATABASE traveloop;
```

---

## 4. Configure Environment Variables

Create `.env`

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/traveloop"
```

---

## 5. Run Prisma Migration

```bash
npx prisma migrate dev --name init
```

---

## 6. Start Development Server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# 🗄️ Prisma Workflow

Whenever you update models:

```bash
npx prisma migrate dev --name update-name
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

# 🔒 Security

* Passwords are hashed using bcryptjs
* Sensitive credentials stored in `.env`
* `.env` should never be pushed to GitHub

---

# 📸 Image Uploads

Uploaded files are stored locally:

```txt
public/uploads/
```

Image paths are stored in PostgreSQL.

---

# 🎯 Hackathon Goals

This project focuses on:

* Relational database design
* Full-stack engineering
* Local-first architecture
* Responsive UI/UX
* Structured backend APIs
* Offline-friendly workflow

---

# 👨‍💻 Team Collaboration

Each teammate should:

* Create meaningful commits
* Pull latest changes before pushing
* Use Git branches when needed
* Understand the code before modifying it

---

# 📌 Future Improvements

* JWT Authentication
* AI Trip Suggestions (Ollama)
* Realtime Collaboration
* Public Trip Sharing
* Advanced Budget Analytics
* Maps Integration

---

# 🧠 Learning Highlights

This project demonstrates:

* Prisma ORM usage
* PostgreSQL relational modeling
* Next.js full-stack architecture
* File upload handling
* Authentication systems
* Scalable proj
