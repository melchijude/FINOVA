import os
import json
import httpx
from groq import Groq
from typing import List, Optional
import base64
from dotenv import load_dotenv
load_dotenv()

FINANCE_BOOKS = [
    {"title": "The Psychology of Money", "author": "Morgan Housel", "type": "book", "description": "Timeless lessons on wealth, greed, and happiness. Explores how behavior drives financial outcomes.", "url": "https://www.goodreads.com/book/show/41881472"},
    {"title": "Rich Dad Poor Dad", "author": "Robert Kiyosaki", "type": "book", "description": "Classic guide on building wealth through assets, investing and financial education.", "url": "https://www.goodreads.com/book/show/69571"},
    {"title": "I Will Teach You To Be Rich", "author": "Ramit Sethi", "type": "book", "description": "Practical guide to automating your finances, saving, and investing without thinking about it.", "url": "https://www.goodreads.com/book/show/4924862"},
    {"title": "The Richest Man in Babylon", "author": "George S. Clason", "type": "book", "description": "Ancient parables teaching timeless financial wisdom about saving, investing and growing wealth.", "url": "https://www.goodreads.com/book/show/1052"},
    {"title": "Your Money or Your Life", "author": "Vicki Robin", "type": "book", "description": "Transforming your relationship with money and achieving financial independence.", "url": "https://www.goodreads.com/book/show/78428"},
    {"title": "Die With Zero", "author": "Bill Perkins", "type": "book", "description": "Getting all you can from your money and your life — maximizing life experiences over accumulation.", "url": "https://www.goodreads.com/book/show/52950915"},
    {"title": "The Millionaire Next Door", "author": "Thomas J. Stanley", "type": "book", "description": "Surprising secrets of wealthy Nigerians and Americans who live below their means.", "url": "https://www.goodreads.com/book/show/998"},
    {"title": "Atomic Habits", "author": "James Clear", "type": "book", "description": "Building tiny financial habits that compound into remarkable results over time.", "url": "https://www.goodreads.com/book/show/40121378"},
]

class FinovaAgent:
    def __init__(self):
        self.groq = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "qwen/qwen3.6-27b"
        self.youtube_api_key = os.getenv("YOUTUBE_API_KEY")
        self.listennotes_api_key = os.getenv("LISTENNOTES_API_KEY")
        self.spotify_client_id = os.getenv("SPOTIFY_CLIENT_ID")
        self.spotify_client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
        self._spotify_token = None

    def _chat(self, messages: list, system: str = "") -> str:
        all_messages = []
        if system:
            all_messages.append({"role": "system", "content": system})
        all_messages.extend(messages)
        response = self.groq.chat.completions.create(
            model=self.model,
            messages=all_messages,
            temperature=0.7,
            max_tokens=2000
        )
        return response.choices[0].message.content

    def _build_persona_summary(self, profile: dict) -> str:
        expenses = profile.get("monthly_expenses", 0)
        income = profile.get("monthly_income", 1)
        spending_ratio = (expenses / income) * 100 if income > 0 else 0
        savings_rate = profile.get('savings_rate', 0)
        challenges = profile.get('financial_challenges', [])

        # Smart contradiction detection
        contradiction_notes = []
        if float(savings_rate) > 0 and 'No savings habit' in challenges:
            contradiction_notes.append(f"Note: User reports {savings_rate}% savings rate but selected 'No savings habit' — actual savings rate of {savings_rate}% should be used in analysis, not zero.")

        notes_text = "\n".join(contradiction_notes) if contradiction_notes else "None"

        return (
            f"Name: {profile.get('name')}\n"
            f"Age: {profile.get('age')}\n"
            f"Monthly Income: N{float(profile.get('monthly_income', 0)):,.0f}\n"
            f"Monthly Expenses: N{float(profile.get('monthly_expenses', 0)):,.0f}\n"
            f"Spending Ratio: {spending_ratio:.1f}% of income\n"
            f"Savings Rate: {savings_rate}%\n"
            f"Top Spending Categories: {json.dumps(profile.get('spending_categories', {}))}\n"
            f"Financial Goals: {', '.join(profile.get('financial_goals', []))}\n"
            f"Financial Challenges: {', '.join(profile.get('financial_challenges', []))}\n"
            f"Risk Tolerance: {profile.get('risk_tolerance')}\n"
            f"Investment Experience: {profile.get('investment_experience')}\n"
            f"Debt Status: {profile.get('debt_status')}\n"
            f"Lifestyle: {profile.get('lifestyle')}\n"
            f"Data Contradictions: {notes_text}\n"
        )

    async def chat(self, profile: dict, conversation_history: list, user_message: str) -> str:
        persona_summary = self._build_persona_summary(profile)

        system = (
            "You are Finova, an intelligent AI Financial Doctor built specifically for Nigerians.\n"
            "You are having a real, intelligent conversation with a user about their finances.\n"
            "You are warm, sharp, direct, and deeply knowledgeable about Nigerian financial realities.\n\n"
            "STRICT RULES:\n"
            "- Always use Naira for ALL currency amounts. Never use $ or USD.\n"
            "- Reference Nigerian tools when relevant: PiggyVest, Cowrywise, Kuda Bank, Carbon, Risevest, Bamboo, Trove\n"
            "- Reference Nigerian realities: NEPA bills, Lagos rent, data subscriptions, owambe, fuel costs, school fees\n"
            "- Recommend Nigerian finance content: Investogist podcast, Fiscal Naija, I Said What I Said podcast\n"
            "- Talk like a brilliant Nigerian friend who knows finance deeply\n"
            "- Give specific actionable advice tailored to their exact financial profile\n"
            "- Use realistic Nigerian Naira figures based on their actual income\n"
            "- Keep responses concise, 3 to 5 sentences unless they ask for more\n"
            "- NEVER respond in JSON. Always respond in plain conversational text.\n"
            "- Answer the user's EXACT question directly first before anything else\n"
            "- If they ask for a podcast, name a SPECIFIC podcast and where to find it\n"
            "- If they ask for a book, recommend a SPECIFIC book with author name\n"
            "- If they ask about money amounts, give a SPECIFIC Naira amount based on their actual income\n"
            "- If they ask to remember something, repeat it back exactly from their profile\n"
            "- Never give the same generic response twice — always give a fresh specific answer\n"
        )

        messages = []
        messages.append({
            "role": "user",
            "content": "Here is my financial profile:\n" + persona_summary
        })
        messages.append({
            "role": "assistant",
            "content": "I have reviewed your financial profile carefully. I understand your full financial situation and I am ready to give you real personalized advice."
        })

        for msg in (conversation_history or [])[-10:]:
            role = msg.get("role", "")
            content = msg.get("content", "")
            if role in ["user", "assistant"] and content:
                messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": user_message})
        return self._chat(messages, system)

    async def diagnose(self, profile: dict) -> dict:
        persona_summary = self._build_persona_summary(profile)

        system = (
            "You are Finova, an AI Financial Doctor built specifically for Nigerians.\n"
            "Analyze financial profiles and provide diagnosis entirely in FIRST PERSON — as if the user is reading about themselves.\n"
            "Write everything as 'Your income is...', 'Your spending shows...', 'You tend to...' NOT 'He/She/They...'\n"
            "Always use Naira for currency, never USD or $.\n"
            "Reference Nigerian financial realities, tools like PiggyVest and Cowrywise.\n"
            "Always respond in valid JSON format only. No extra text outside the JSON."
        )

        prompt = (
            "Analyze this financial profile and generate a comprehensive first-person diagnosis:\n\n"
            + persona_summary +
            "\nIMPORTANT: Write all text fields in FIRST PERSON directed at the user (use 'you/your', not 'he/she/they').\n"
            "If there are data contradictions noted, use the actual data (e.g. actual savings rate) not the contradicting label.\n"
            "\nRespond with ONLY a JSON object:\n"
            '{\n'
            '  "persona_label": "A creative Nigerian label e.g. The Sharp Guy Wey No Save",\n'
            '  "financial_health_score": <number 0-100>,\n'
            '  "diagnosis_summary": "2-3 sentences in first person e.g. Your spending ratio shows...",\n'
            '  "strengths": ["Your income is consistent", "You have clear financial goals"],\n'
            '  "risk_areas": ["Your savings rate is below recommended", "Your lifestyle spending is high"],\n'
            '  "mindset_profile": "First person description of their financial mindset e.g. You tend to...",\n'
            '  "lifestyle_assessment": "First person assessment e.g. Your lifestyle choices show...",\n'
            '  "prescription_focus": ["First area for you to focus on", "Second area", "Third area"],\n'
            '  "urgency_level": "low or medium or high or critical"\n'
            '}'
        )

        result = self._chat([{"role": "user", "content": prompt}], system)
        try:
            cleaned = result.strip()
            if "```" in cleaned:
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            return json.loads(cleaned.strip())
        except Exception as e:
            print(f"Diagnosis parse error: {e}")
            return {"error": "Diagnosis parsing failed", "raw": result}

    async def simulate_review(self, profile: dict, resource: dict) -> dict:
        persona_summary = self._build_persona_summary(profile)

        system = (
            "You are Finova, an AI that models how Nigerian users review financial resources.\n"
            "Simulate exactly how this user would rate and review the given resource.\n"
            "Always use Naira for currency. Never use $ or USD.\n"
            "Always respond in valid JSON format only. No extra text outside the JSON."
        )

        prompt = (
            "Given this user profile:\n" + persona_summary +
            "\nSimulate how they would rate and review this resource:\n"
            f"Title: {resource.get('title')}\n"
            f"Type: {resource.get('type')}\n"
            f"Author: {resource.get('author')}\n"
            f"Description: {resource.get('description')}\n\n"
            "Respond with ONLY a JSON object:\n"
            '{\n'
            '  "star_rating": <1-5>,\n'
            '  "rating_confidence": <0.0-1.0>,\n'
            '  "review_title": "Their review headline",\n'
            '  "review_text": "Their full review in authentic Nigerian voice, 150-250 words",\n'
            '  "sentiment": "positive or mixed or negative",\n'
            '  "key_resonances": ["thing1", "thing2"],\n'
            '  "key_criticisms": ["thing1", "thing2"],\n'
            '  "would_recommend": true or false,\n'
            '  "behavioral_notes": "Why they rated it this way",\n'
            '  "simulated_helpfulness_votes": <number 0-100>\n'
            '}'
        )

        result = self._chat([{"role": "user", "content": prompt}], system)
        try:
            cleaned = result.strip()
            if "```" in cleaned:
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            return json.loads(cleaned.strip())
        except Exception as e:
            print(f"Review parse error: {e}")
            return {"error": "Simulation parsing failed", "raw": result}

    async def recommend(self, profile: dict, conversation_history: list, user_message: str = None) -> dict:
        persona_summary = self._build_persona_summary(profile)
        external_resources = await self.fetch_external_resources(self._infer_topic_from_profile(profile))

        # Always include curated books
        all_resources = FINANCE_BOOKS + external_resources

        system = (
            "You are Finova, an AI Financial Doctor built for Nigerians.\n"
            "Reason carefully before prescribing financial resources.\n"
            "Always use Naira for ALL currency. Never use $ or USD.\n"
            "Reference Nigerian tools: PiggyVest, Cowrywise, Kuda, Carbon, Risevest.\n"
            "IMPORTANT: Always include at least 1-2 BOOKS in recommendations.\n"
            "Also include at least 1 podcast and 1 video when available.\n"
            "Write doctor_note in first person directed at the user (use 'your', not 'his/her').\n"
            "Always respond in valid JSON format only. No extra text outside the JSON."
        )

        history_text = ""
        if conversation_history:
            history_text = "\n".join([
                f"{m['role'].upper()}: {m['content']}"
                for m in conversation_history[-6:]
            ])

        resources_text = json.dumps(all_resources[:15], indent=2)

        prompt = (
            "User Financial Profile:\n" + persona_summary +
            "\nConversation History:\n" + history_text +
            f"\nCurrent Message: {user_message or 'Give me my personalized financial prescription'}\n"
            "\nAvailable Resources (MUST include books from this list):\n" + resources_text +
            "\nRespond with ONLY a JSON object:\n"
            '{\n'
            '  "reasoning_chain": ["step1", "step2", "step3", "step4"],\n'
            '  "prescription": {\n'
            '    "primary_focus": "Main area to address",\n'
            '    "doctor_note": "Personal note in first person Nigerian context with Naira amounts",\n'
            '    "recommendations": [\n'
            '      {\n'
            '        "rank": 1,\n'
            '        "title": "Resource title",\n'
            '        "type": "book or video or podcast",\n'
            '        "author": "Creator name",\n'
            '        "why_prescribed": "Reason tied to their Nigerian profile in first person",\n'
            '        "expected_impact": "What this will change for them",\n'
            '        "difficulty": "beginner or intermediate or advanced",\n'
            '        "time_to_value": "How quickly they will see results",\n'
            '        "url": "URL if available from the resources list"\n'
            '      }\n'
            '    ],\n'
            '    "transformation_path": "Their journey in Nigerian context in first person",\n'
            '    "follow_up_question": "One question to refine recommendations further"\n'
            '  },\n'
            '  "cold_start_handled": true,\n'
            '  "cross_domain_applied": true\n'
            '}'
        )

        result = self._chat([{"role": "user", "content": prompt}], system)
        try:
            cleaned = result.strip()
            if "```" in cleaned:
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            return json.loads(cleaned.strip())
        except Exception as e:
            print(f"Recommend parse error: {e}")
            return {"error": "Recommendation parsing failed", "raw": result}

    def _infer_topic_from_profile(self, profile: dict) -> str:
        challenges = profile.get("financial_challenges", [])
        goals = profile.get("financial_goals", [])
        if challenges:
            return challenges[0]
        if goals:
            return goals[0]
        return "personal finance Nigeria"

    async def _get_spotify_token(self) -> str:
        if self._spotify_token:
            return self._spotify_token
        credentials = f"{self.spotify_client_id}:{self.spotify_client_secret}"
        encoded = base64.b64encode(credentials.encode()).decode()
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://accounts.spotify.com/api/token",
                headers={"Authorization": f"Basic {encoded}"},
                data={"grant_type": "client_credentials"}
            )
            data = response.json()
            self._spotify_token = data.get("access_token")
            return self._spotify_token

    async def fetch_external_resources(self, topic: str) -> list:
        resources = []
        query = f"{topic} personal finance Nigeria"

        # YouTube
        try:
            async with httpx.AsyncClient() as client:
                yt_response = await client.get(
                    "https://www.googleapis.com/youtube/v3/search",
                    params={
                        "part": "snippet",
                        "q": query,
                        "type": "video",
                        "maxResults": 5,
                        "key": self.youtube_api_key,
                        "relevanceLanguage": "en"
                    },
                    timeout=10
                )
                yt_data = yt_response.json()
                for item in yt_data.get("items", []):
                    snippet = item.get("snippet", {})
                    video_id = item.get("id", {}).get("videoId", "")
                    resources.append({
                        "title": snippet.get("title"),
                        "type": "video",
                        "author": snippet.get("channelTitle"),
                        "description": snippet.get("description", "")[:200],
                        "url": f"https://youtube.com/watch?v={video_id}",
                        "source": "YouTube"
                    })
        except Exception as e:
            print(f"YouTube fetch error: {e}")

        # Spotify — try multiple queries for better results
        spotify_queries = [query, "Nigeria personal finance podcast", "financial freedom Nigeria"]
        for sp_query in spotify_queries:
            try:
                token = await self._get_spotify_token()
                if not token:
                    break
                async with httpx.AsyncClient() as client:
                    sp_response = await client.get(
                        "https://api.spotify.com/v1/search",
                        params={"q": sp_query, "type": "show", "market": "NG", "limit": 3},
                        headers={"Authorization": f"Bearer {token}"},
                        timeout=10
                    )
                    sp_data = sp_response.json()
                    for item in sp_data.get("shows", {}).get("items", []):
                        if item and item.get("name") not in [r.get("title") for r in resources]:
                            resources.append({
                                "title": item.get("name"),
                                "type": "podcast",
                                "author": item.get("publisher"),
                                "description": item.get("description", "")[:200],
                                "url": item.get("external_urls", {}).get("spotify"),
                                "source": "Spotify"
                            })
                if len([r for r in resources if r["type"] == "podcast"]) >= 3:
                    break
            except Exception as e:
                print(f"Spotify fetch error: {e}")
                break

        # Listen Notes
        try:
            async with httpx.AsyncClient() as client:
                ln_response = await client.get(
                    "https://listen-api.listennotes.com/api/v2/search",
                    params={"q": query, "type": "episode", "len_min": 10},
                    headers={"X-ListenAPI-Key": self.listennotes_api_key},
                    timeout=10
                )
                ln_data = ln_response.json()
                for item in ln_data.get("results", [])[:4]:
                    resources.append({
                        "title": item.get("title_original"),
                        "type": "podcast",
                        "author": item.get("podcast", {}).get("title_original", "Unknown"),
                        "description": item.get("description_original", "")[:200],
                        "url": item.get("listennotes_url"),
                        "source": "Listen Notes"
                    })
        except Exception as e:
            print(f"Listen Notes fetch error: {e}")

        return resources