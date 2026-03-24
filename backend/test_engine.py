"""
Tests for engine.py

Run with: pytest test_engine.py -v
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import json
from engine import OpenRouterClient, ResumeAnalyzer, InterviewEngine
from config import Config


class TestOpenRouterClient:
    """Test suite for OpenRouterClient."""

    def test_client_initialization(self):
        """Test client initialization with provided API key."""
        client = OpenRouterClient(api_key="test-key-123")
        assert client.api_key == "test-key-123"
        assert client.call_count == 0

    def test_client_missing_api_key(self):
        """Test error when API key is missing."""
        with pytest.raises(ValueError, match="OPENROUTER_API_KEY not found"):
            # Temporarily remove API key
            original_key = Config.OPENROUTER_API_KEY
            Config.OPENROUTER_API_KEY = ""
            try:
                OpenRouterClient()
            finally:
                Config.OPENROUTER_API_KEY = original_key

    def test_get_headers(self):
        """Test that headers are properly formatted."""
        client = OpenRouterClient(api_key="test-key")
        headers = client._get_headers()
        
        assert headers["Authorization"] == "Bearer test-key"
        assert headers["X-Title"] == "InterviewIQ"
        assert "HTTP-Referer" in headers

    @patch('engine.requests.post')
    def test_call_api_success(self, mock_post):
        """Test successful API call."""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "choices": [{"message": {"content": "Test response"}}],
            "model": "test-model"
        }
        mock_post.return_value = mock_response
        
        client = OpenRouterClient(api_key="test-key")
        result = client.call_api(
            model="test-model",
            prompt="Test prompt"
        )
        
        assert result["choices"][0]["message"]["content"] == "Test response"
        assert client.call_count == 1

    @patch('engine.requests.post')
    def test_call_api_with_system_prompt(self, mock_post):
        """Test API call with system prompt."""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "choices": [{"message": {"content": "Response"}}]
        }
        mock_post.return_value = mock_response
        
        client = OpenRouterClient(api_key="test-key")
        client.call_api(
            model="test-model",
            prompt="User prompt",
            system_prompt="System context"
        )
        
        # Check that system message is included
        call_args = mock_post.call_args
        payload = call_args.kwargs["json"]
        assert len(payload["messages"]) == 2
        assert payload["messages"][0]["role"] == "system"

    def test_extract_message(self):
        """Test message extraction from API response."""
        client = OpenRouterClient(api_key="test-key")
        response = {
            "choices": [
                {"message": {"content": "Extracted message"}}
            ]
        }
        
        message = client.extract_message(response)
        assert message == "Extracted message"


class TestResumeAnalyzer:
    """Test suite for ResumeAnalyzer."""

    @patch.object(OpenRouterClient, 'call_api')
    def test_analyze_resume_success(self, mock_api):
        """Test successful resume analysis."""
        mock_api.return_value = {
            "choices": [{"message": {"content": json.dumps({
                "skills": ["Python", "Java"],
                "experience_level": "mid",
                "domains": ["Backend", "ML"]
            })}}]
        }
        
        analyzer = ResumeAnalyzer(OpenRouterClient(api_key="test-key"))
        result = analyzer.analyze_resume("Sample resume text")
        
        assert "skills" in result
        assert "experience_level" in result
        assert result["experience_level"] == "mid"

    @patch.object(OpenRouterClient, 'call_api')
    def test_analyze_resume_with_json_extraction(self, mock_api):
        """Test resume analysis with JSON extraction from text."""
        mock_api.return_value = {
            "choices": [{"message": {"content": """
            Here is the analysis:
            {
                "skills": ["Python"],
                "experience_level": "junior",
                "domains": ["Backend"]
            }
            """}}]
        }
        
        analyzer = ResumeAnalyzer(OpenRouterClient(api_key="test-key"))
        result = analyzer.analyze_resume("Sample resume")
        
        assert result["skills"] == ["Python"]
        assert result["experience_level"] == "junior"


class TestInterviewEngine:
    """Test suite for InterviewEngine."""

    @patch.object(OpenRouterClient, 'call_api')
    def test_generate_question(self, mock_api):
        """Test interview question generation."""
        mock_api.return_value = {
            "choices": [{"message": {"content": "What is your experience with Python?"}}]
        }
        
        engine = InterviewEngine(OpenRouterClient(api_key="test-key"))
        resume_data = {
            "skills": ["Python", "Java"],
            "experience_level": "mid",
            "domains": ["Backend"]
        }
        
        question = engine.generate_question(resume_data, "Senior Backend Engineer")
        assert "Python" in question or "experience" in question.lower()

    @patch.object(OpenRouterClient, 'call_api')
    def test_evaluate_answer(self, mock_api):
        """Test answer evaluation."""
        mock_api.return_value = {
            "choices": [{"message": {"content": json.dumps({
                "score": 8,
                "clarity": 4,
                "depth": 4,
                "relevance": 4,
                "strengths": ["Clear explanation"],
                "weaknesses": ["Needs more depth"],
                "feedback": "Good answer overall."
            })}}]
        }
        
        engine = InterviewEngine(OpenRouterClient(api_key="test-key"))
        resume_data = {"experience_level": "mid"}
        
        evaluation = engine.evaluate_answer(
            "What is Python?",
            "Python is a programming language",
            resume_data,
            "Backend Engineer"
        )
        
        assert evaluation["score"] == 8
        assert "strengths" in evaluation

    @patch.object(OpenRouterClient, 'call_api')
    def test_generate_report(self, mock_api):
        """Test final report generation."""
        engine = InterviewEngine(OpenRouterClient(api_key="test-key"))
        
        evaluations = [
            {"score": 8, "strengths": ["Clear"], "weaknesses": ["Verbose"]},
            {"score": 7, "strengths": ["Accurate"], "weaknesses": ["Slow"]},
        ]
        
        report = engine.generate_report(
            session_id="test-123",
            questions_and_answers=[{"Q": "Q1", "A": "A1"}],
            evaluations=evaluations,
            resume_data={"experience_level": "mid"},
            role="Backend Engineer"
        )
        
        assert report["average_score"] == 7.5
        assert report["recommendation"] == "HIRE - Good technical fit with some areas to develop"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
