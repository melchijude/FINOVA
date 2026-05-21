from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from agents import FinovaAgent

app = FastAPI(title="Finova API", description="Your Financial Doctor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = FinovaAgent()

class UserProfile(BaseModel):
    name: str
    age: int
    monthly_income: float
    monthly_expenses: float
    savings_rate: float
    spending_categories: dict
    financial_goals: List[str]
    financial_challenges: List[str]
    risk_tolerance: str
    investment_experience: str
    debt_status: str
    lifestyle: str

class ReviewRequest(BaseModel):
    user_profile: UserProfile
    resource_title: str
    resource_type: str
    resource_description: str
    resource_author: str

class RecommendRequest(BaseModel):
    user_profile: UserProfile
    conversation_history: Optional[List[dict]] = []
    user_message: Optional[str] = None

class ChatRequest(BaseModel):
    user_profile: UserProfile
    conversation_history: Optional[List[dict]] = []
    user_message: str

@app.get("/")
def root():
    return {"message": "Finova - Your Financial Doctor", "status": "healthy"}

@app.post("/api/diagnose")
async def diagnose_user(profile: UserProfile):
    try:
        diagnosis = await agent.diagnose(profile.dict())
        return {"success": True, "diagnosis": diagnosis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulate-review")
async def simulate_review(request: ReviewRequest):
    try:
        result = await agent.simulate_review(
            request.user_profile.dict(),
            {
                "title": request.resource_title,
                "type": request.resource_type,
                "description": request.resource_description,
                "author": request.resource_author
            }
        )
        return {"success": True, "simulation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommend")
async def recommend(request: RecommendRequest):
    try:
        result = await agent.recommend(
            request.user_profile.dict(),
            request.conversation_history,
            request.user_message
        )
        return {"success": True, "recommendation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        response = await agent.chat(
            request.user_profile.dict(),
            request.conversation_history,
            request.user_message
        )
        return {"success": True, "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fetch-resources")
async def fetch_resources(query: dict):
    try:
        resources = await agent.fetch_external_resources(query.get("topic", "personal finance Nigeria"))
        return {"success": True, "resources": resources}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))