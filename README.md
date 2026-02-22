```markdown
<div align="center">

  <img src="https://img.shields.io/badge/Production%20Ready-Ready%20to%20Deploy-8B5CF6?style=for-the-badge&logo=rocket&logoColor=white" alt="Production Ready" />

  <h1 style="font-size: 3.8rem; margin: 16px 0 8px; background: linear-gradient(90deg, #A78BFA, #C4B5FD, #DDD6FE); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800;">
    ✨ AITutor
  </h1>
  
  <h3 style="color: #64748B; font-weight: 500;">AI-Powered Tutor for Indian Students</h3>
  
  <p style="font-size: 1.35rem; max-width: 620px; margin: 20px auto;">
    Enter <strong>any topic</strong> → Receive a crystal-clear explanation → Take a smart 10-question mock test grounded in what you just learned.
  </p>

  <img src="https://via.placeholder.com/1100x520/0F172A/A78BFA?text=🎓+AITutor+Interface+%E2%80%94+Light+Purple+%26+Modern" 
       alt="AITutor Preview" 
       width="920" 
       style="border-radius: 24px; box-shadow: 0 30px 80px -20px rgba(167, 139, 246, 0.5); margin: 30px 0 40px;">

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
    <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  </p>

</div>

---

## 🌟 Why AITutor?

**Learning made delightful for Bharat’s students.**

No more boring textbooks. Just type **“Photosynthesis”**, **“Quadratic Equations”**, or **“Indian Independence”** and instantly get:
- A beautifully structured, exam-focused explanation
- A 10-question mock test that actually tests understanding
- Instant scoring + detailed feedback

Built from the ground up for Indian curriculum (CBSE, ICSE, State Boards, JEE/NEET ready).

---

## ✨ Features

<div align="center" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin: 40px 0;">

  <div style="background: #1E2937; padding: 28px; border-radius: 20px; border: 2px solid #A78BFA;">
    ⚡ <strong>Lightning Fast</strong><br>
    <span style="color:#94A3B8;">30–60 seconds from topic to test</span>
  </div>

  <div style="background: #1E2937; padding: 28px; border-radius: 20px; border: 2px solid #A78BFA;">
    🧠 <strong>120B Deep Reasoning</strong><br>
    <span style="color:#94A3B8;">Powered by GPT-OSS via OpenRouter</span>
  </div>

  <div style="background: #1E2937; padding: 28px; border-radius: 20px; border: 2px solid #A78BFA;">
    📝 <strong>Perfectly Grounded Quizzes</strong><br>
    <span style="color:#94A3B8;">Every question comes from the explanation</span>
  </div>

  <div style="background: #1E2937; padding: 28px; border-radius: 20px; border: 2px solid #A78BFA;">
    🎨 <strong>Stunning Light-Purple UI</strong><br>
    <span style="color:#94A3B8;">Modern, responsive, delightful to use</span>
  </div>

</div>

---

## 🛠 Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend**  | FastAPI, Python 3.12, Pydantic v2               |
| **AI**       | OpenRouter → **GPT-OSS 120B**                   |
| **Deploy**   | Docker + docker-compose (production ready)      |

---

## 📁 Project Structure

```bash
aitutor/
├── backend/
│   ├── app/
│   │   ├── core/config.py          # Settings (Pydantic)
│   │   ├── models/schemas.py       # Request / Response models
│   │   ├── services/ai_service.py  # All LLM logic
│   │   ├── api/routes/tutor.py     # FastAPI endpoints
│   │   └── main.py                 # App factory
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
└── frontend/
    ├── app/
    │   ├── components/tutor/       # TopicInput, QuizView...
    │   ├── hooks/useLearn.ts       # Client state + API
    │   ├── lib/api.ts              # Typed fetch
    │   └── page.tsx
    ├── tailwind.config.ts
    ├── next.config.mjs
    └── Dockerfile
```

---

## 🚀 Quick Start (Local Dev)

### Backend
```bash
cd backend
cp .env.example .env
# Paste your OPENROUTER_API_KEY

python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
# Swagger → http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local

npm install
npm run dev
# → http://localhost:3000
```

---

## 🐳 Docker (Production)

```bash
# Ensure OPENROUTER_API_KEY is in backend/.env
docker-compose up --build -d
```

**Frontend** → http://localhost:3000  
**API Docs** → http://localhost:8000/docs

---

## 📡 API Endpoints

| Method | Path                    | Description                          |
|--------|-------------------------|--------------------------------------|
| **POST** | `/api/v1/tutor/learn`   | Generate explanation + quiz (30-60s) |
| **POST** | `/api/v1/tutor/score`   | Score quiz answers (instant)         |
| **GET**  | `/api/v1/tutor/health`  | Health check                         |

### Example: Learn
```json
{
  "topic": "Photosynthesis",
  "language": "en"
}
```

### Example: Score
```json
{
  "quiz": [ /* array of QuizQuestion */ ],
  "answers": ["A", "True", null, ...]
}
```

---

## 🔑 Environment Variables

**Backend** (`backend/.env`)
```env
OPENROUTER_API_KEY=sk-or-v1-...
DEBUG=false
ALLOWED_ORIGINS=["http://localhost:3000"]
```

**Frontend** (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

<div align="center" style="margin: 80px 0 40px;">

  <h2 style="background: linear-gradient(90deg, #A78BFA, #C4B5FD); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
    Built with 💜 for the future of Indian education
  </h2>
  
  <p style="color: #64748B; font-size: 1.1rem;">
    Light purple elegance • Black & white clarity • Production-ready excellence
  </p>

</div>
```