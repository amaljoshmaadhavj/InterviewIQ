# InterviewIQ Frontend Setup Guide (Phase 5 & 6)

## Quick Start Commands

### 1. Initialize Next.js 15 Project

```bash
# From InterviewIQ root directory (where you see /backend)
cd ..
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --no-git \
  --src-dir

# Navigate to frontend
cd frontend
```

### 2. Install Additional Dependencies

```bash
npm install lucide-react framer-motion axios clsx tailwind-merge
npm install -D @types/node @types/react @types/react-dom
```

### 3. Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing page
│   │   ├── interview/
│   │   │   ├── page.tsx            # Interview chat page
│   │   │   └── report/
│   │   │       └── page.tsx        # Report page
│   │   └── history/
│   │       └── page.tsx            # Interview history
│   │
│   ├── components/
│   │   ├── UploadZone.tsx          # Drag-and-drop upload
│   │   ├── RoleSelector.tsx        # Role selection
│   │   ├── ChatInterface.tsx       # Interview chat
│   │   ├── Navigation.tsx          # Top navigation
│   │   └── ProgressBar.tsx         # Neural analyzing animation
│   │
│   ├── context/
│   │   └── AppContext.tsx          # Global state (session, resume)
│   │
│   ├── services/
│   │   └── api.ts                  # API client for backend
│   │
│   ├── utils/
│   │   ├── cn.ts                   # Class name utility
│   │   └── types.ts                # TypeScript types
│   │
│   └── styles/
│       └── globals.css             # Global styles
│
├── package.json
└── next.config.ts
```

### 4. Run the Project

```bash
# Development server
npm run dev

# Frontend will be at: http://localhost:3000
# Backend at: http://localhost:8000
# Both running simultaneously
```

### 5. Environment Setup (Optional)

Create `.env.local` for API configuration:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Next.js Frontend                │
│  (TypeScript + Tailwind + Framer)       │
└──────────────┬──────────────────────────┘
               │
        ┌──────▼──────┐
        │  AppContext │ (Global State)
        │ session_id  │
        │resume_data  │
        └──────┬──────┘
               │
        ┌──────▼────────┐
        │ API Service   │
        │ (axios)       │
        └──────┬────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
FastAPI Backend      Swagger UI Docs
http://8000          http://8000/docs
```

---

## Next Steps

1. ✅ Run the initialization commands above
2. ✅ Create files in order shown in this guide
3. ✅ Copy component code (provided below)
4. ✅ Test at http://localhost:3000

Ready to proceed? ✅

---

## Theme Configuration

**Colors**:
- Primary: Deep Charcoal (#0F172A, #1E293B)
- Accent: Electric Blue (#0EA5E9, #06B6D4)
- Background: Almost Black (#020617)
- Text: White/Gray-100

**Tailwind Setup**:
Already configured by create-next-app with dark mode support.

---

## What We'll Build

| Page | Component | Features |
|------|-----------|----------|
| **/** | Landing | Hero + Upload Drag-Drop |
| **/interview** | Chat | Messages + Feed + Streaming |
| **/interview/report** | Report | Score + Recommendation + History |
| **/history** | History | Past interviews list |

All with smooth Framer Motion animations and responsive design.

---

Status: Ready for code generation ✅
