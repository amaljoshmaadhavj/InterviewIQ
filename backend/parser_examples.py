"""
Usage examples for the Resume Parser
"""

from parser import parse_resume
import json


def example_parse_single_resume():
    """Example: Parse a single resume."""
    
    # Parse the resume
    result = parse_resume("path/to/resume.pdf")
    
    # Check if parsing was successful
    if result["status"] == "success":
        print("✓ Resume parsed successfully")
        print(f"Sections found: {result['sections_found']}")
        
        # Access cleaned text for LLM processing
        cleaned_text = result["full_text"]
        print(f"Text length: {len(cleaned_text)} characters")
        
        # Access individual sections
        if "skills" in result["sections"]:
            print(f"Skills: {result['sections']['skills']}")
        
        if "experience" in result["sections"]:
            print(f"Experience: {result['sections']['experience']}")
            
        # Use full cleaned text to send to Gemini for structuring
        structured_data = send_to_gemini_for_analysis(cleaned_text)
        return structured_data
    else:
        print(f"✗ Parsing failed: {result['error']}")
        return None


def send_to_gemini_for_analysis(cleaned_text):
    """
    Send cleaned resume text to Gemini Flash via OpenRouter for structuring.
    This will be in engine.py
    """
    prompt = f"""Analyze the following resume and extract structured information.
    
    Resume:
    {cleaned_text}
    
    Return as JSON with:
    - skills: list of technical skills
    - projects: list of projects with brief descriptions
    - experience_level: "junior", "mid", or "senior"
    - domains: list of technical domains (e.g., "Backend", "ML", "DevOps")
    """
    
    # This will be implemented in engine.py
    # response = call_openrouter_api(prompt, model="google/gemini-2.0-flash:free")
    # return json.loads(response)
    pass


if __name__ == "__main__":
    # Usage
    result = example_parse_single_resume()
    if result:
        print("\nStructured Resume Data:")
        print(json.dumps(result, indent=2))
