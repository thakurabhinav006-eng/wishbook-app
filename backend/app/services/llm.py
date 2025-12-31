from openai import AsyncOpenAI
from app.core.config import settings

# Initialize client pointing to Groq AI
client = AsyncOpenAI(
    base_url=settings.GROQ_BASE_URL,
    api_key=settings.GROQ_API_KEY
)

import time

# Metrics
LATENCY_HISTORY = []

async def generate_wish_text(request):
    start_time = time.time()
    if not settings.GROQ_API_KEY:
        return "Error: Groq API Key is missing. Please configure it in the backend."

    prompt = f"Write a {request.tone} {request.occasion} wish for {request.recipient_name}. "
    if request.extra_details:
        prompt += f"Details: {request.extra_details}. "
    prompt += f"Keep it {request.length}."

    try:
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that writes personalized wishes."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7,
        )
        duration = (time.time() - start_time) * 1000 # ms
        LATENCY_HISTORY.append({"timestamp": time.time(), "latency": duration})
        if len(LATENCY_HISTORY) > 100: LATENCY_HISTORY.pop(0)
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq AI Error: {e}")
        return f"Error generating wish with Groq AI: {str(e)}"

async def generate_wish_from_words(words, mode):
    if not settings.GROQ_API_KEY:
        return ["Error: Groq API Key is missing."] * len(words)

    results = []
    for word in words:
        prompt = f"Create a creative wish or message using the word: {word}"
        try:
            response = await client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=60
            )
            results.append(response.choices[0].message.content.strip())
        except Exception as e:
            results.append(f"Error for {word}: {str(e)}")
    return results

async def get_llm_response(prompt: str) -> str:
    if not settings.GROQ_API_KEY:
         raise Exception("Groq API Key is missing")
    try:
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300, 
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq AI Error: {e}")
        raise e
