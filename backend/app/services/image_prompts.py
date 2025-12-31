from app.services.llm import get_llm_response

async def generate_visual_description(wish_text: str) -> str:
    """
    Converts a wish text into a vivid visual description for an image generator.
    """
    prompt = f"""
    Act as an expert art director. 
    I have a greeting card wish: "{wish_text}".
    
    Describe a single, beautiful, high-quality background image that captures the mood and essence of this wish.
    Your description will be fed into a Text-to-Image AI.
    
    Rules:
    - Describe the visual elements, lighting, style, and colors.
    - Be vivid and artistic (e.g., "cinematic lighting", "digital art", "soft focus", "nebula", "watercolor").
    - Do NOT include text in the image description (no signboards, no words).
    - Keep it under 25 words.
    - Output ONLY the description.
    """
    
    description = await get_llm_response(prompt)
    return description.strip()
