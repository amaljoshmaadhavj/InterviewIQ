# Development Tasks: InterviewIQ MVP

## Phase 1: Setup
- [ ] Create project structure (frontend + backend)
- [ ] Setup .env with OPENROUTER_API_KEY
- [ ] Create requirements.txt

## Phase 2: Resume Processing
- [ ] Implement parser.py using PyMuPDF
- [ ] Clean extracted text
- [ ] Test with different resume formats

## Phase 3: OpenRouter Integration
- [ ] Create engine.py
- [ ] Implement analyze_resume() (Gemini Flash)
- [ ] Implement generate_question() (LLaMA 3.3)
- [ ] Implement evaluate_interview()

## Phase 4: Backend APIs
- [ ] Setup FastAPI app
- [ ] Implement /upload endpoint
- [ ] Implement /interview/start endpoint
- [ ] Implement /interview/chat endpoint
- [ ] Implement /report endpoint

## Phase 5: Database
- [ ] Setup SQLite with SQLAlchemy
- [ ] Create interviews table
- [ ] Create messages table

## Phase 6: Frontend
- [ ] Build resume upload UI
- [ ] Build chat interface
- [ ] Connect backend APIs

## Phase 7: Dashboard
- [ ] Display interview history
- [ ] Show scores
- [ ] Highlight weak areas

## Phase 8: Optimization
- [ ] Minimize API calls
- [ ] Add error handling
- [ ] Add loading states