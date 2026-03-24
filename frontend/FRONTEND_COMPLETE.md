# InterviewIQ Frontend - Complete Implementation Guide

## 📋 Overview

This document covers the complete Next.js 15 frontend implementation for InterviewIQ Phase 5 & 6. The frontend is built with TypeScript, Tailwind CSS, Framer Motion, and integrates with the FastAPI backend running on `http://localhost:8000`.

## 🎨 Design System

**Color Scheme:**
- **Deep Charcoal**: `#0F172A` (Primary dark background)
- **Electric Blue**: `#0EA5E9` (Accent color)
- **Gradient**: Cyan → Cyan → Blue (`#06b6d4` → `#0ea5e9` → `#3b82f6`)

**Typography:**
- **Headlines**: Inter Bold (via Tailwind)
- **Body**: Inter Regular (via Tailwind)

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Landing page with hero + upload
│   ├── globals.css             # Global Tailwind styles
│   ├── role-selection/
│   │   └── page.tsx            # Role selection page
│   ├── interview/
│   │   ├── page.tsx            # Interview chat page
│   │   └── report/
│   │       └── page.tsx        # Interview report page
│   └── history/
│       └── page.tsx            # Interview history page
│
├── src/
│   ├── components/
│   │   ├── UploadZone.tsx      # Drag-drop resume upload
│   │   ├── Navigation.tsx      # Top navbar
│   │   ├── RoleSelector.tsx    # Role selection grid
│   │   └── ChatInterface.tsx   # Interview chat interface
│   │
│   ├── context/
│   │   └── AppContext.tsx      # React Context for global state
│   │
│   ├── services/
│   │   └── api.ts              # Axios API client (6 endpoints)
│   │
│   ├── utils/
│   │   ├── types.ts            # TypeScript interfaces (10 types)
│   │   ├── helpers.ts          # Utility functions (5 functions)
│   │   └── cn.ts               # Class name combiner
│   │
│   └── providers.tsx           # App provider (AppProvider + Navigation)
│
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind theme configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.js           # PostCSS configuration
├── .env.local                  # Environment variables
└── README.md                   # This file
```

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Backend**: FastAPI server running on `http://localhost:8000`

### 2. Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment (optional - defaults to localhost:8000)
# Edit .env.local if backend is on a different URL
```

### 3. Development Server

```bash
# Start development server
npm run dev

# Frontend will be available at http://localhost:3000
```

### 4. Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔌 API Integration

All backend endpoints are accessible through the centralized `APIClient` in `src/services/api.ts`.

### Configured Endpoints

1. **GET /health**
   - Check backend connectivity
   - Used on app initialization

2. **POST /upload**
   - Upload resume PDF
   - Returns resume analysis (skills, experience extracted)

3. **POST /interview/start**
   - Create new interview session
   - Returns first question

4. **POST /interview/chat**
   - Submit interview answer
   - Returns evaluation + next question

5. **GET /interview/report/{session_id}**
   - Fetch complete interview report
   - Returns scores and recommendations

6. **GET /interviews**
   - Get interview history
   - Returns list of past interviews

### Error Handling

All API errors are caught and displayed as user-friendly messages:
- Network errors: "Unable to connect to server"
- Validation errors: Specific field feedback
- Server errors: Generic message with error code

## 📱 Page Guide

### Landing Page (`/`)

**Components Used:**
- Hero section with gradient text
- Features grid (AI Interviewer, Real-time Feedback, Reports)
- Upload zone with drag-drop support

**Flow:**
1. User lands on page
2. Sees features and benefits
3. Uploads resume PDF
4. Automatically redirected to role selection

**Key Features:**
- Responsive design (mobile-first)
- Animated hero section
- Feature cards with icons

### Role Selection (`/role-selection`)

**Components Used:**
- Role selector with 8 pre-defined roles
- Info box explaining interview flow
- Start button with confirmation

**Roles Available:**
1. Frontend Engineer
2. Backend Engineer
3. Full Stack Developer
4. Data Scientist
5. DevOps Engineer
6. AI/ML Engineer
7. Senior Backend Engineer
8. Product Manager

**Flow:**
1. User selects role
2. Clicks "Start Interview"
3. Session created, first question fetched
4. Redirected to interview page

**Key Features:**
- Role cards with experience level
- Responsive grid (1-3 columns)
- Loading state during start
- Interview flow info

### Interview Chat (`/interview`)

**Components Used:**
- Chat interface with auto-scroll
- Message bubbles (Q&A + evaluation)
- Input textarea with keyboard support
- Question counter
- Completion status

**Message Types:**
- **Question**: Interviewer asks question
- **Answer**: User's response
- **Evaluation**: Detailed feedback with scores
  - Clarity, Depth, Relevance scores
  - Strengths and weaknesses
  - Overall score

**Flow:**
1. First question displays
2. User types answer
3. Submit (Enter/Button)
4. Evaluation displays with feedback
5. Next question appears
6. Repeat until 5 questions complete
7. "View Report" button appears

**Key Features:**
- Auto-scrolling chat
- Real-time validation
- Loading animations
- Score indicators
- Keyboard shortcuts (Shift+Enter for new line)
- Evaluation breakdown grid

### Interview Report (`/interview/report`)

**Components Used:**
- Overall score card
- Recommendation text
- Question breakdown (5 questions)
- Action buttons (Download, History, New Interview)

**Data Displayed:**
- Overall score (0-50)
- Recommendation (text)
- Per-question evaluation:
  - Score /10
  - Feedback text
  - Clarity/Depth/Relevance breakdown
  - Strengths (green bullets)
  - Weaknesses (orange bullets)

**Flow:**
1. User completes interview
2. Reports page loads automatically
3. Summary displays with score
4. Question breakdown expands
5. Can view history or start new interview

**Key Features:**
- Animated score reveal
- Progress bars for each interview
- Color-coded recommendations
- Detailed breakdown grid
- Export functionality (stub)

### Interview History (`/history`)

**Components Used:**
- Interview list with cards
- Performance progress bars
- Navigation to reports

**Data Displayed:**
- Role
- Score
- Date
- Performance percentage

**Flow:**
1. User clicks History in navbar
2. Past interviews load
3. Can click any interview to see full report
4. Can start new interview

**Key Features:**
- Sorted by date (most recent first)
- Performance visualization
- Quick access to reports
- Empty state message

## 🎭 Component Details

### UploadZone.tsx

**Features:**
- Drag-and-drop PDF upload
- File validation (PDF only, <10MB)
- Progress animation (0-100%)
- "Neural Analyzing..." text
- Error handling
- Success state with redirect

**Props:** None (uses context)

**State:**
- `isDragging`: Track drag state
- `isUploading`: Show progress
- `progress`: Animation progress 0-100
- `error`: Error message

**Animations:**
- Upload icon bounce
- Rotating progress ring
- Gradient progress bar
- Fade transitions

### Navigation.tsx

**Features:**
- Fixed top navbar
- Brain icon + "InterviewIQ" logo
- History link with active state
- Responsive design
- Hover animations

**Responsive:**
- Mobile: Logo only
- Desktop: Full nav with links

**Animations:**
- Hover scale (1.05)
- Smooth transitions
- Icon rotation on hover

### RoleSelector.tsx

**Features:**
- 8 role cards in responsive grid
- Selection state indication
- Experience level display
- Info box with interview flow
- Start button with validation

**Props:** None (uses context)

**State:**
- `selectedRole`: Currently selected role
- `isStarting`: Loading state

**Grid Layout:**
- 1 column (mobile)
- 2 columns (tablet)
- 3 columns (desktop)

**Animations:**
- Staggered card entrance
- Scale on hover/select
- Button pulse on ready

### ChatInterface.tsx

**Features:**
- Message bubbles with auto-scroll
- Real-time message updates
- Evaluation display with breakdown
- Input textarea (Shift+Enter support)
- Question counter
- Completion detection

**Props:** None (uses context)

**State:**
- `input`: User text input
- `isSubmitting`: Send button state
- `questionNumber`: Current question (1-5)
- `isInterviewComplete`: Session complete flag

**Message Types:**
```typescript
type ChatMessage = {
  id: string;
  type: 'question' | 'answer' | 'evaluation';
  sender: 'candidate' | 'interviewer';
  content: string;
  evaluation?: EvaluationData;
  timestamp: Date;
};
```

**Animations:**
- Staggered message entrance
- Rotating loader on submit
- Score color transitions
- Modal entrance animations

## 🔐 Context API

### AppContext.tsx

**Global State Shape:**
```typescript
{
  sessionId: string | null;
  resumeData: ResumeData | null;
  selectedRole: string | null;
  currentQuestion: string;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
```

**Methods:**
- `setSessionId(id)`: Set current session
- `setResumeData(data)`: Store resume analysis
- `setSelectedRole(role)`: Store selected role
- `setCurrentQuestion(q)`: Set current question
- `addChatMessage(msg)`: Append to chat history
- `setLoading(bool)`: Loading state
- `setError(msg)`: Error message
- `resetInterview()`: Clear session data

**Hook Usage:**
```typescript
const { state, setSessionId, addChatMessage } = useApp();
```

## 🎨 Tailwind Configuration

### Custom Colors

In `tailwind.config.ts`:

```typescript
colors: {
  charcoal: {
    950: '#0F172A',   // Deepest
    900: '#1E293B',   // Deep
    800: '#334155',
    700: '#475569',
    600: '#64748B',
  },
  electric: {
    50: '#F0F9FF',
    // ... through 900
    500: '#0EA5E9',   // Primary accent
  }
}
```

### Utilities

**Available Utility Classes:**
- `.gradient-text`: Gradient text effect
- `.focus-ring`: Accessibility focus styles
- `.btn-primary`: Primary button style
- `.btn-secondary`: Secondary button style
- `.card`: Card container style
- `.card-hover`: Card with hover effects

**Custom Animations:**
- `.pulse-glow`: Glowing pulse animation
- `.float`: Floating animation

## 🌐 Environment Variables

### `.env.local`

```env
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional
NODE_ENV=development
```

### Development vs Production

- **Development**: `http://localhost:8000`
- **Production**: Configure before build (e.g., `https://api.example.com`)

## 📦 Dependencies

### Core
- `next`: 15.0.0 - React framework
- `react`: 19.0.0 - UI library
- `react-dom`: 19.0.0 - DOM rendering

### UI/Animation
- `framer-motion`: 11.0.0 - Smooth animations
- `lucide-react`: 0.334.0 - Icon library
- `tailwindcss`: 3.4.0 - CSS framework

### HTTP
- `axios`: 1.6.0 - API client

### Development
- `typescript`: 5.0.0 - Type checking
- `autoprefixer`: 10.4.0 - CSS vendor prefixes
- `postcss`: 8.4.0 - CSS processing
- `eslint`: 8.0.0 - Code linting

## 🧪 Testing the Frontend

### 1. Manual Testing Checklist

**Upload Page:**
- [ ] Drag and drop PDF works
- [ ] File validation (PDF only)
- [ ] File size validation (<10MB)
- [ ] Progress animation displays
- [ ] Success redirects to role selection

**Role Selection:**
- [ ] All 8 roles display correctly
- [ ] Selection state highlights role
- [ ] Start button activates on selection
- [ ] Loading animation shows during start
- [ ] Redirects to interview page

**Interview Chat:**
- [ ] First question displays
- [ ] Input textarea works
- [ ] Enter submits answer
- [ ] Shift+Enter creates new line
- [ ] Answer displays in chat
- [ ] Evaluation shows with scores
- [ ] Next question appears
- [ ] Question counter increments
- [ ] After 5 questions, completion button shows

**Report Page:**
- [ ] Overall score displays
- [ ] Recommendation shows
- [ ] All 5 questions breakdown
- [ ] Scores and feedback visible
- [ ] Strengths and weaknesses display
- [ ] Action buttons work

**History Page:**
- [ ] Past interviews load
- [ ] Score bars display correctly
- [ ] Can click interview to see report
- [ ] Empty state shows if no history

### 2. API Integration Testing

```bash
# Test backend connectivity
curl http://localhost:8000/health

# Test with frontend
# Check browser console for network logs
# All requests should show in Network tab
```

### 3. TypeScript Validation

```bash
# Check for type errors
npm run type-check
```

## 🚢 Deployment

### Build for Production

```bash
# Create optimized build
npm run build

# Start production server
npm start
```

### Environment Configuration

Before deploying:

1. Update `.env.local` with production API URL
2. Set `NODE_ENV=production`
3. Run build verification
4. Test all pages

### Deployment Platforms

**Recommended:**
- **Vercel** (Official Next.js hosting)
  ```bash
  npm install -g vercel
  vercel
  ```

- **AWS Amplify**
- **DigitalOcean App Platform**
- **Netlify** (with manual build settings)

### CORS Configuration

Frontend runs on `localhost:3000` by default. Backend CORS is configured to allow:
- `http://localhost:3000`
- `http://localhost:3001` (alternate)
- All standard HTTP methods
- All headers

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend"

**Solution:**
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check `.env.local` CORS settings
3. Verify both services on same network
4. Check browser console for errors

### Issue: Resume upload fails

**Solution:**
1. Verify file is PDF
2. Check file size (<10MB)
3. Check backend upload endpoint
4. Look for error message in chat

### Issue: Styles not loading

**Solution:**
```bash
# Rebuild Tailwind cache
rm -rf .next
npm run dev
```

### Issue: TypeScript errors

**Solution:**
```bash
# Check for errors
npm run type-check

# Run linting
npm run lint
```

## 📚 Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Lucide Icons**: https://lucide.dev
- **TypeScript**: https://www.typescriptlang.org/docs

## ✅ Implementation Status

**Phase 5 & 6 - Frontend Development Progress:**

- [x] Project initialization (package.json, tsconfig, tailwind config)
- [x] TypeScript types (types.ts - 10 interfaces)
- [x] API client service (api.ts - 6 endpoints)
- [x] Global state management (AppContext.tsx)
- [x] UI components:
  - [x] UploadZone (drag-drop, progress animation)
  - [x] Navigation (responsive navbar)
  - [x] RoleSelector (8 roles, grid layout)
  - [x] ChatInterface (interview chat, auto-scroll)
- [x] Page layouts:
  - [x] Root layout (layout.tsx, providers)
  - [x] Landing page (page.tsx)
  - [x] Role selection (role-selection/page.tsx)
  - [x] Interview (interview/page.tsx)
  - [x] Report (interview/report/page.tsx)
  - [x] History (history/page.tsx)
- [x] Styling (globals.css, tailwind.config.ts)
- [x] Configuration (next.config.ts, .env.local)

## 📝 Next Steps

1. **Run the development server**: `npm run dev`
2. **Test all pages**: Navigate through user flow
3. **Integration testing**: Test with real backend
4. **Performance optimization**: Run Lighthouse audit
5. **Accessibility audit**: Check WCAG compliance
6. **Deploy to Vercel**: For production

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✅ Phase 5 & 6 Complete
