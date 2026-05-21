# Finova — Diagnose. Prescribe. Transform.

> **Your Financial Doctor** — An LLM-powered agentic system that analyzes financial behavior and prescribes personalized resources to transform your financial health.

---

## Overview

Finova is a unified AI agent that addresses both tasks of the DSN x BCT LLM Agent Challenge:

- **Task A (User Modeling):** Simulates how a specific user would rate and review any financial resource — capturing their tone, rating behavior, and contextual nuance based on their financial profile.
- **Task B (Recommendation):** Delivers personalized financial resource recommendations (books, videos, podcasts) with an agentic reasoning chain — going beyond collaborative filtering to contextual, conversational, and cold-start-aware recommendations.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FINOVA AGENT                       │
│                                                       │
│  User Input (income, spending, lifestyle, behavior)  │
│           ↓                                           │
│  Financial Persona Diagnosis (Groq LLM)              │
│           ↓                                           │
│  ┌────────────────┐    ┌────────────────────────┐   │
│  │  TASK A        │    │  TASK B                │   │
│  │  Review        │    │  Recommendation        │   │
│  │  Simulation    │    │  Agent with Reasoning  │   │
│  │                │    │                        │   │
│  │  • Star Rating │    │  • Reasoning Chain     │   │
│  │  • Review Text │    │  • Ranked Resources    │   │
│  │  • Tone Match  │    │  • Cold-Start Handling │   │
│  │  • Behavioral  │    │  • Multi-turn Chat     │   │
│  │    Fidelity    │    │  • Cross-domain        │   │
│  └────────────────┘    └────────────────────────┘   │
│                                                       │
│  External APIs: YouTube, Spotify, Listen Notes        │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) |
| Backend | Python FastAPI |
| LLM | Groq (llama-3.3-70b-versatile) |
| Video Data | YouTube Data API v3 |
| Podcast Data | Listen Notes API + Spotify API |
| Container | Docker + Docker Compose |

---

## Setup & Running

### Prerequisites
- Docker & Docker Compose installed
- API keys for: Groq, YouTube, Listen Notes, Spotify

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/finova.git
cd finova
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env and fill in your API keys
```

### 3. Run with Docker Compose
```bash
docker-compose up --build
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3000
- **API Docs:** http://localhost:3000/docs

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/diagnose` | Generate financial persona diagnosis |
| POST | `/api/simulate-review` | Task A: Simulate user review/rating |
| POST | `/api/recommend` | Task B: Agentic recommendations |
| POST | `/api/fetch-resources` | Fetch resources from external APIs |

---

## Agentic Workflow

Finova's recommendation agent reasons before prescribing:

1. **Diagnose** — Analyze user's financial profile, spending behavior, and lifestyle
2. **Profile** — Assign a financial persona archetype (e.g. "The Impulsive Dreamer")
3. **Reason** — Chain-of-thought reasoning through the user's most urgent needs
4. **Fetch** — Pull real-time resources from YouTube, Spotify, and Listen Notes
5. **Rank** — Score and rank resources by relevance to the user's specific profile
6. **Prescribe** — Deliver personalized recommendations with explicit reasoning
7. **Converse** — Refine recommendations through multi-turn conversation

---

## Features

- **Financial Health Score** — 0-100 score based on behavioral analysis
- **Persona Labeling** — Creative archetypes that describe financial behavior
- **Review Simulation (Task A)** — Simulate star ratings + written reviews for any resource
- **Agentic Recommendations (Task B)** — Reasoned, personalized prescriptions
- **Conversational Refinement** — Multi-turn chat to refine recommendations
- **Cold-Start Handling** — Works even with minimal user history
- **Cross-Domain** — Books, videos, and podcasts in one unified prescription
- **Real-Time Data** — Pulls current resources from YouTube, Spotify, Listen Notes

---

## Evaluation Alignment

### Task A (User Modeling)
- ✅ Review Text Quality — LLM generates contextually appropriate, persona-matched reviews
- ✅ Rating Accuracy — Ratings calibrated to user financial situation and resource fit
- ✅ Behavioral Fidelity — Reviews reflect user's actual spending patterns and challenges

### Task B (Recommendation)
- ✅ Ranking Quality — Resources ranked by relevance to user profile
- ✅ Cold-Start — Profile-based recommendations work without prior interaction history
- ✅ Contextual Relevance — Human-readable reasoning chain explains every recommendation
- ✅ Cross-Domain — Spans books, videos, and podcasts seamlessly

---

## Solution Paper

See `solution_paper.pdf` for the full 4-8 page write-up covering:
- Approach and architecture decisions
- Experiments and ablation studies
- What could be done with more time

---

*Built for the DSN x BCT LLM Agent Challenge 2025*
