<div align="center">

  <img src="https://img.shields.io/badge/Production%20Ready-8B5CF6?style=for-the-badge&logo=rocket&logoColor=white" alt="Production Ready" />

  <h1 style="margin: 12px 0 6px; font-size: 3.4rem;">🍇 AI-Tutor 🍇</h1>
  <h3>AI-Powered Tutor for Indian Students</h3>

  <p><strong>Enter any topic → Crystal-clear explanation → Ace a smart 10-question mock test grounded in what you just learned</strong></p>

  <img src="https://api.pikwy.com/web/699afea9b44da05a310deb4c.png" 
       alt="AITutor Preview" 
       width="920" />

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
    <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  </p>

</div>

---

## 🌟 Why AITutor?

**Learning made delightful for Bharat’s students.**

No more boring textbooks. Type **“Photosynthesis”**, **“Quadratic Equations”**, or **“Indian Constitution”** and instantly get:

- Beautifully structured, exam-focused explanation  
- 10 high-quality mock questions based **exactly** on what you learned  
- Instant scoring + feedback  

Perfect for CBSE, ICSE, State Boards, JEE & NEET.

---

## ✨ Features

| Feature                  | Description |
|--------------------------|-----------|
| ⚡ **Lightning Fast**     | Full explanation + 10-question quiz in 30-60 seconds |
| 🧠 **Deep Intelligence**  | Powered by GPT-OSS 120B via OpenRouter |
| 🎯 **Perfectly Grounded** | Every question comes directly from the explanation |
| 💜 **Stunning Design**    | Elegant light purple + clean black/white modern UI |
| 📱 **Fully Responsive**   | Works beautifully on mobile & desktop |

---

## 🛠 Tech Stack

| Layer      | Technology |
|------------|----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend**  | FastAPI, Python 3.12, Pydantic v2 |
| **AI**       | OpenRouter → GPT-OSS 120B |
| **Deploy**   | Docker + docker-compose |

---

## 📁 Project Structure

```bash
aitutor/
├── backend/
│   ├── app/
│   │   ├── core/config.py
│   │   ├── models/schemas.py
│   │   ├── services/ai_service.py
│   │   ├── api/routes/tutor.py
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
└── frontend/
    ├── app/
    │   ├── components/tutor/
    │   ├── hooks/useLearn.ts
    │   ├── lib/api.ts
    │   └── page.tsx
    ├── tailwind.config.ts
    └── Dockerfile