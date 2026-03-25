"""
LLM Integration Engine using OpenRouter API

Handles communication with Gemini Flash and LLaMA 3.3 models via OpenRouter.
Implements: resume analysis, question generation, answer evaluation.
"""

import logging
import json
import re
from typing import Dict, List, Optional, Any
import requests
from config import Config


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class OpenRouterClient:
    """Client for communicating with OpenRouter API."""

    def __init__(self, api_key: str = None):
        """
        Initialize OpenRouter client.
        
        Args:
            api_key: OpenRouter API key (uses Config.OPENROUTER_API_KEY if not provided)
            
        Raises:
            ValueError: If API key is not provided or empty
        """
        self.api_key = api_key or Config.OPENROUTER_API_KEY
        if not self.api_key:
            raise ValueError(
                "OPENROUTER_API_KEY not found. "
                "Please set it in .env file or pass as parameter."
            )
        
        self.api_url = Config.OPENROUTER_API_URL
        self.call_count = 0

    def _get_headers(self):
        """Get request headers for OpenRouter API."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": Config.OPENROUTER_APP_URL,
            "X-Title": Config.OPENROUTER_APP_NAME,
            "Content-Type": "application/json",
        }

    def call_api(
        self, 
        model: str, 
        prompt: str, 
        system_prompt: str = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> Dict[str, Any]:
        """
        Make a request to OpenRouter API.
        
        Args:
            model: Model identifier (e.g., "google/gemini-2.0-flash:free")
            prompt: User prompt/message
            system_prompt: System context (optional)
            temperature: Sampling temperature (0-2)
            max_tokens: Maximum response length
            
        Returns:
            API response containing model output
            
        Raises:
            Exception: If API call fails
        """
        try:
            messages = []
            
            if system_prompt:
                messages.append({
                    "role": "system",
                    "content": system_prompt
                })
            
            messages.append({
                "role": "user",
                "content": prompt
            })
            
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            
            logger.info(f"Calling model: {model}")
            logger.debug(f"Prompt length: {len(prompt)} characters")
            
            response = requests.post(
                f"{self.api_url}/chat/completions",
                headers=self._get_headers(),
                json=payload,
                timeout=60
            )
            
            response.raise_for_status()
            self.call_count += 1
            
            result = response.json()
            logger.info(
                f"API call successful (total calls: {self.call_count}). "
                f"Model: {result.get('model', 'unknown')}"
            )
            
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            if hasattr(e.response, 'text'):
                logger.error(f"Response: {e.response.text}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse API response: {e}")
            raise

    def extract_message(self, response: Dict[str, Any]) -> str:
        """Extract message content from API response."""
        try:
            return response["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as e:
            logger.error(f"Failed to extract message from response: {e}")
            raise


class ResumeAnalyzer:
    """Analyze resume and extract structured data using Gemini Flash."""

    def __init__(self, client: OpenRouterClient = None):
        """Initialize analyzer with OpenRouter client."""
        self.client = client or OpenRouterClient()

    def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """
        Analyze resume and extract structured information.
        
        Uses Gemini Flash to quickly structure resume data.
        
        Args:
            resume_text: Cleaned resume text from parser
            
        Returns:
            Dictionary containing:
            - skills: List of technical skills
            - projects: List of project descriptions
            - experience_level: "junior", "mid", or "senior"
            - domains: List of technical domains
            - raw_response: Full API response
            
        Raises:
            Exception: If analysis fails
        """
        system_prompt = """You are an expert resume analyst. 
        Extract and structure resume information into clear, categorized data.
        Return valid JSON only."""
        
        user_prompt = f"""Analyze this resume and extract the following information.
        
RESUME:
{resume_text}

Return a JSON object with:
- skills: array of technical skills/technologies
- experience_level: "junior" (0-2 yrs), "mid" (2-5 yrs), "senior" (5+ yrs)
- domains: array of technical domains (examples: Backend, Frontend, ML, DevOps, etc.)
- projects: array of project names/descriptions (keep brief)
- summary: 1-2 sentence professional summary

Ensure valid JSON format."""
        
        try:
            response = self.client.call_api(
                model=Config.RESUME_ANALYSIS_MODEL,
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.3,  # Low temperature for consistent structure
                max_tokens=1000
            )
            
            message = self.client.extract_message(response)
            
            # Try to parse JSON from response
            try:
                # Find JSON in the response
                json_match = re.search(r'\{.*\}', message, re.DOTALL)
                if json_match:
                    structured_data = json.loads(json_match.group())
                else:
                    structured_data = json.loads(message)
            except json.JSONDecodeError:
                logger.warning("Failed to parse JSON response, returning raw message")
                structured_data = {
                    "skills": [],
                    "experience_level": "mid",
                    "domains": [],
                    "projects": [],
                    "summary": "Resume analysis in progress"
                }
            
            # Ensure all required fields are present
            structured_data.setdefault("skills", [])
            structured_data.setdefault("experience_level", "mid")
            structured_data.setdefault("domains", [])
            structured_data.setdefault("projects", [])
            structured_data.setdefault("summary", "Professional resume")
            structured_data["raw_response"] = message
            
            logger.info("Resume analysis successful")
            
            return structured_data
            
        except Exception as e:
            logger.error(f"Resume analysis failed: {e}")
            raise


class InterviewEngine:
    """Generate interview questions and evaluate answers using LLaMA 3.3."""

    def __init__(self, client: OpenRouterClient = None):
        """Initialize interview engine with OpenRouter client."""
        self.client = client or OpenRouterClient()

    def generate_question(
        self,
        resume_data: Dict[str, Any],
        role: str,
        chat_history: List[Dict[str, str]] = None,
        question_number: int = 1,
    ) -> str:
        """
        Generate an interview question based on resume and role.
        
        Args:
            resume_data: Structured resume data from analyze_resume()
            role: Target job role
            chat_history: Previous questions and answers in conversation
            question_number: Question sequence number
            
        Returns:
            Generated interview question
            
        Raises:
            Exception: If question generation fails
        """
        
        # Build context from chat history
        history_context = ""
        if chat_history:
            history_context = "\n\nPrevious conversation:\n"
            for msg in chat_history[-4:]:  # Keep last 2 exchanges
                # Handle both dict and ORM Message objects
                if isinstance(msg, dict):
                    role = msg.get('role', 'unknown')
                    content = msg.get('content', '')[:200]
                else:
                    role = msg.sender if hasattr(msg, 'sender') else msg.get('role', 'unknown')
                    content = msg.content if hasattr(msg, 'content') else msg.get('content', '')
                    if isinstance(content, str):
                        content = content[:200]
                history_context += f"- {role}: {content}...\n"
        
        system_prompt = f"""You are a senior technical interviewer with 10+ years of experience.
You are interviewing a candidate for the role: {role}

Candidate Background:
- Skills: {', '.join(resume_data.get('skills', [])[:5])}
- Experience Level: {resume_data.get('experience_level', 'unknown')}
- Domains: {', '.join(resume_data.get('domains', []))}

Ask one clear, challenging but fair interview question. 
- Question {question_number}/5
- Make it specific to their background and the role
- Avoid yes/no questions
- Focus on practical problem-solving or technical depth"""
        
        user_prompt = f"""Generate question #{question_number} for this interview.{history_context}

Ask a question that:
1. Assesses relevant technical skills
2. Is appropriate for their experience level
3. Relates to the {role} role"""
        
        try:
            response = self.client.call_api(
                model=Config.INTERVIEW_MODEL,
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.8,  # Higher for variety
                max_tokens=500
            )
            
            question = self.client.extract_message(response).strip()
            logger.info(f"Generated question #{question_number}")
            
            return question
            
        except Exception as e:
            logger.error(f"Question generation failed: {e}")
            raise

    def evaluate_answer(
        self,
        question: str,
        answer: str,
        resume_data: Dict[str, Any],
        role: str,
    ) -> Dict[str, Any]:
        """
        Evaluate interview answer.
        
        Args:
            question: The question asked
            answer: Candidate's answer
            resume_data: Candidate's resume data
            role: Target job role
            
        Returns:
            Dictionary containing:
            - score: 0-10 score
            - strengths: List of positive points
            - weaknesses: List of areas needing improvement
            - feedback: Brief feedback message
            
        Raises:
            Exception: If evaluation fails
        """
        
        system_prompt = f"""You are a senior technical interview evaluator.
Candidate role: {role}
Candidate experience level: {resume_data.get('experience_level', 'unknown')}

Evaluate answers fairly but critically."""
        
        user_prompt = f"""Evaluate this interview answer.

QUESTION: {question}

ANSWER: {answer}

Provide evaluation in JSON format:
{{
    "score": <int 0-10>,
    "clarity": <1-5>,
    "depth": <1-5>,
    "relevance": <1-5>,
    "strengths": [<list of 2-3 positive points>],
    "weaknesses": [<list of 2-3 areas to improve>],
    "feedback": "<2-3 sentence constructive feedback>"
}}"""
        
        try:
            response = self.client.call_api(
                model=Config.INTERVIEW_MODEL,
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.4,
                max_tokens=500
            )
            
            message = self.client.extract_message(response)
            
            # Parse JSON evaluation
            try:
                json_match = re.search(r'\{.*\}', message, re.DOTALL)
                if json_match:
                    evaluation = json.loads(json_match.group())
                else:
                    evaluation = json.loads(message)
            except json.JSONDecodeError:
                logger.warning("Failed to parse evaluation JSON")
                evaluation = {"score": 5, "feedback": message}
            
            # Ensure all required fields are present
            evaluation.setdefault("score", 5)
            evaluation.setdefault("clarity", 3)
            evaluation.setdefault("depth", 3)
            evaluation.setdefault("relevance", 3)
            evaluation.setdefault("strengths", ["Good attempt", "Shows understanding"])
            evaluation.setdefault("weaknesses", ["Could be more detailed"])
            evaluation.setdefault("feedback", message if isinstance(message, str) else "Evaluation complete")
            
            logger.info(f"Answer evaluated with score: {evaluation.get('score', 'N/A')}")
            return evaluation
            
        except Exception as e:
            logger.error(f"Answer evaluation failed: {e}")
            raise

    def generate_report(
        self,
        session_id: str,
        questions_and_answers: List[Dict[str, str]],
        evaluations: List[Dict[str, Any]],
        resume_data: Dict[str, Any],
        role: str,
    ) -> Dict[str, Any]:
        """
        Generate final interview report.
        
        Args:
            session_id: Interview session ID
            questions_and_answers: List of Q&A pairs
            evaluations: List of evaluations for each answer
            resume_data: Candidate resume data
            role: Target job role
            
        Returns:
            Final report with scores and recommendations
        """
        
        scores = [e.get('score', 5) for e in evaluations]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Collect strengths and weaknesses
        all_strengths = []
        all_weaknesses = []
        
        for eval_item in evaluations:
            all_strengths.extend(eval_item.get('strengths', []))
            all_weaknesses.extend(eval_item.get('weaknesses', []))
        
        # Generate overall recommendation
        if avg_score >= 8:
            recommendation = "STRONG HIRE - Excellent fit for the role"
        elif avg_score >= 6:
            recommendation = "HIRE - Good technical fit with some areas to develop"
        elif avg_score >= 4:
            recommendation = "MAYBE - Needs improvement in key areas"
        else:
            recommendation = "NO HIRE - Significant gaps in required skills"
        
        report = {
            "session_id": session_id,
            "role": role,
            "experience_level": resume_data.get('experience_level'),
            "total_questions": len(questions_and_answers),
            "scores": scores,
            "average_score": round(avg_score, 1),
            "recommendation": recommendation,
            "strengths": list(set(all_strengths))[:5],
            "weaknesses": list(set(all_weaknesses))[:5],
            "total_api_calls": self.client.call_count,
        }
        
        logger.info(f"Report generated for session {session_id}")
        return report


# Convenience functions
def analyze_resume_file(resume_text: str) -> Dict[str, Any]:
    """Convenience function to analyze resume."""
    analyzer = ResumeAnalyzer()
    return analyzer.analyze_resume(resume_text)


def generate_interview_question(
    resume_data: Dict[str, Any],
    role: str,
    chat_history: List[Dict[str, str]] = None,
) -> str:
    """Convenience function to generate interview question."""
    engine = InterviewEngine()
    return engine.generate_question(resume_data, role, chat_history)


def evaluate_interview_answer(
    question: str,
    answer: str,
    resume_data: Dict[str, Any],
    role: str,
) -> Dict[str, Any]:
    """Convenience function to evaluate interview answer."""
    engine = InterviewEngine()
    return engine.evaluate_answer(question, answer, resume_data, role)
