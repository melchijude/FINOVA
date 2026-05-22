# ✚ Finova — Your Finance Doctor

> **Diagnose. Prescribe. Transform.**
> An LLM-powered agentic financial system built specifically for Nigerians.

![Finova](https://img.shields.io/badge/Finova-Your%20Finance%20Doctor-C9A84C?style=for-the-badge)
![Groq](https://img.shields.io/badge/LLM-Groq%20LLaMA%203.3%2070B-green?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React%20Vite-61DAFB?style=for-the-badge)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=for-the-badge)

---

## What is Finova?

Millions of Nigerians work hard, earn decent incomes, and still end every month asking: *"Where did my money go?"* The gap between financial perception and financial reality is wide — and no tool was built specifically to close it for Nigerians.

**Finova was.**

Finova is a unified AI financial agent that acts as your personal Financial Doctor. It analyzes your income, spending behavior, lifestyle, and financial goals — then diagnoses your financial health, simulates how you'd review financial resources, and prescribes personalized books, videos, and podcasts to transform your financial mindset.

---

## The Problem — Meet Mr Gbadebo

Mr Gbadebo is a 31-year-old accountant earning ₦280,000/month. He believes he saves 20% of his salary every month. His bank statement says otherwise — ₦0 in savings, 95% of income spent.

This is not a character flaw. It is a systemic problem. Finova was built for every Mr Gbadebo in Nigeria.

---

## How It Works

```
┌──────────────────────────────────────────────────────────────┐
│                      FINOVA AGENT                            │
│                                                              │
│  1. User fills onboarding → income, spending, lifestyle,     │
│     goals, challenges, risk tolerance                        │
│                    ↓                                         │
│  2. Groq LLM builds Financial Persona with CoT reasoning     │
│                    ↓                                         │
│  ┌─────────────────────┐   ┌──────────────────────────────┐ │
│  │  TASK A             │   │  TASK B                      │ │
│  │  Review Simulation  │   │  Recommendation Engine       │ │
│  │                     │   │                              │ │
│  │  • Star Rating      │   │  • Chain-of-Thought Reasoning│ │
│  │  • Written Review   │   │  • Books + Videos + Podcasts │ │
│  │  • Tone Matching    │   │  • Cold-Start Handling       │ │
│  │  • Behavioral       │   │  • Multi-turn Chat           │ │
│  │    Fidelity         │   │  • Cross-Domain Recs         │ │
│  └─────────────────────┘   └──────────────────────────────┘ │
│                                                              │
│  External APIs: YouTube · Spotify · Listen Notes             │
│  Curated Books: 8 handpicked finance titles always included  │
└──────────────────────────────────────────────────────────────┘
```

---

## Features

- 🔬 **Financial Diagnosis** — Deep behavioral analysis with a Financial Health Score (0-100)
- 🏷️ **Persona Labeling** — Creative Nigerian archetypes (e.g. "The Sharp Guy Wey No Save")
- 💊 **Personalized Prescription** — Books, videos, podcasts ranked by relevance to your profile
- 🧪 **Review Simulation (Task A)** — Simulate star ratings + written reviews in your authentic voice
- 🤖 **Agentic Reasoning (Task B)** — Agent thinks step-by-step before recommending
- 💬 **Ask Finova Chat** — Multi-turn conversational financial doctor with memory
- ❄️ **Cold-Start Handling** — Works from the very first interaction, no history needed
- 🌍 **Cross-Domain** — Books, videos, and podcasts in one unified prescription
- 🇳🇬 **Built for Nigeria** — ₦ currency, PiggyVest, Cowrywise, Kuda, Lagos realities
- 💾 **Session Memory** — Profile persists on refresh and browser back navigation
- 📱 **Mobile Responsive** — Works on phones and tablets

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM | Groq — LLaMA 3.3 70B Versatile |
| Backend | Python FastAPI |
| Frontend | React (Vite) |
| Video Data | YouTube Data API v3 |
| Podcast Data | Listen Notes API + Spotify API (market=NG) |
| Book Data | 8 curated finance titles (always included) |
| Containerization | Docker + Docker Compose |
| Reasoning | Chain-of-Thought Prompting |
| Hosting | Render |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/diagnose` | Generate financial persona + health score |
| POST | `/api/simulate-review` | Task A — Simulate user review and star rating |
| POST | `/api/recommend` | Task B — Agentic recommendations with reasoning |
| POST | `/api/chat` | Intelligent multi-turn conversational agent |
| POST | `/api/fetch-resources` | Fetch real-time content from YouTube, Spotify, Listen Notes |

---

## Setup & Running Locally

### Prerequisites
- Python 3.11+
- Node.js 20+
- API keys for: Groq, YouTube, Listen Notes, Spotify

### 1. Clone the repo
```bash
git clone https://github.com/melchijude/FINOVA.git
cd finova
```

### 2. Backend setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Create backend `.env`
```bash
# Create backend/.env with:
GROQ_API_KEY=your_groq_key
YOUTUBE_API_KEY=your_youtube_key
LISTENNOTES_API_KEY=your_listennotes_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret
```

### 4. Create frontend `.env`
```bash
# Create frontend/.env with:
VITE_API_URL=http://localhost:8000
```

### 5. Run backend
```bash
cd backend
uvicorn main:app --reload
```

### 6. Run frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

App runs at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## Run with Docker

```bash
cp .env.example .env
# Fill in your API keys in .env

docker-compose up --build
```

App runs at **http://localhost**

---

## Agentic Workflow

Finova reasons before prescribing — never jumps to conclusions:

1. **Collect** — User shares income, spending, lifestyle, goals and challenges
2. **Diagnose** — Groq LLM analyzes profile with Chain-of-Thought reasoning
3. **Model** — Financial persona built from behavioral patterns
4. **Simulate** — Task A: Simulates how user would review any resource
5. **Reason** — Task B: Agent thinks through user's most urgent needs step by step
6. **Fetch** — Pulls real-time resources from YouTube, Spotify, Listen Notes
7. **Prescribe** — Delivers ranked recommendations with explicit reasoning
8. **Converse** — Refines prescription through intelligent multi-turn chat

---

## Nigerian Context

| Layer | Localization |
|-------|-------------|
| Currency | All amounts in Naira (₦) — never USD |
| Fintech | PiggyVest, Cowrywise, Kuda Bank, Carbon, Risevest, Bamboo, Trove |
| Culture | Owambe, aso-ebi, Lagos transport, NEPA bills, family pressure |
| Podcasts | Spotify API configured with market=NG |
| AI Tone | Warm, direct — like a brilliant Nigerian friend who knows finance |

---

## Evaluation Alignment

### Task A — User Modeling
| Metric | How Finova Addresses It |
|--------|------------------------|
| Review Text Quality (ROUGE/BERTScore) | Persona-grounded generation — contextually rich, non-generic reviews |
| Rating Accuracy (RMSE) | Ratings calibrated to how well resource matches user's specific challenges |
| Behavioral Fidelity (Human Eval) | Tone, vocabulary and emotional response reflect actual financial behavior |

### Task B — Recommendation
| Metric | How Finova Addresses It |
|--------|------------------------|
| Ranking Quality (NDCG@10) | Resources ranked by persona-relevance score |
| Cold-Start | Profile-based reasoning works from first interaction |
| Contextual Relevance | Human-readable reasoning chain explains every recommendation |
| Cross-Domain | Books + videos + podcasts in one unified prescription |

---

## Project Structure

```
FINOVA/
├── backend/
│   ├── main.py          ← FastAPI app (6 endpoints)
│   ├── agents.py        ← Finova AI Agent (Task A + B + Chat)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx    ← Homepage
│   │   │   ├── Onboarding.jsx ← 5-step financial profiling
│   │   │   └── Dashboard.jsx  ← Diagnosis + Prescription + Simulate + Chat
│   │   ├── App.jsx
│   │   └── index.css
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Solution Paper

See `FINOVA_Solution_Paper.pdf` — an 8-page write-up covering:
- The problem through Mr Gbadebo's story
- Approach and architecture decisions
- Experiments run (model selection, prompt architecture, API quality)
- Ablation studies
- What could be done with more time

---

*Built for the DSN × Bluechip Technologies LLM Agent Challenge 2026*