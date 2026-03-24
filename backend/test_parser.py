"""
Tests for parser.py

Run with: pytest test_parser.py -v
"""

import pytest
import tempfile
from pathlib import Path
from parser import ResumeParser, parse_resume


class TestResumeParser:
    """Test suite for ResumeParser class."""

    def test_file_not_found(self):
        """Test error handling for non-existent files."""
        with pytest.raises(FileNotFoundError):
            ResumeParser("/tmp/nonexistent_resume.pdf")

    def test_invalid_file_type(self):
        """Test error handling for non-PDF files."""
        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
            temp_file = f.name
            f.write(b"Not a PDF")
        
        try:
            with pytest.raises(ValueError, match="File must be a PDF"):
                ResumeParser(temp_file)
        finally:
            Path(temp_file).unlink()

    def test_clean_text_multiple_newlines(self):
        """Test cleaning of multiple consecutive newlines."""
        parser = ResumeParser.__new__(ResumeParser)
        
        text = "Line 1\n\n\nLine 2\n\n\nLine 3"
        cleaned = parser.clean_text(text)
        
        assert "\n\n" not in cleaned
        assert "Line 1" in cleaned
        assert "Line 2" in cleaned
        assert "Line 3" in cleaned

    def test_clean_text_tabs_and_spaces(self):
        """Test cleaning of tabs and multiple spaces."""
        parser = ResumeParser.__new__(ResumeParser)
        
        text = "Text\t\twith\t  multiple  spaces"
        cleaned = parser.clean_text(text)
        
        assert "\t" not in cleaned
        assert "  " not in cleaned
        assert "Text with multiple spaces" in cleaned

    def test_clean_text_special_characters(self):
        """Test replacement of bullet points and special characters."""
        parser = ResumeParser.__new__(ResumeParser)
        
        text = "• Skill one\n• Skill two\n· Skill three"
        cleaned = parser.clean_text(text)
        
        assert "•" not in cleaned
        assert "·" not in cleaned
        assert "- Skill one" in cleaned

    def test_clean_text_hyphenated_lines(self):
        """Test fixing hyphenated line breaks."""
        parser = ResumeParser.__new__(ResumeParser)
        
        text = "This is a hyphen-\nated word"
        cleaned = parser.clean_text(text)
        
        assert "-\n" not in cleaned
        assert "hyphenated" in cleaned

    def test_section_identification(self):
        """Test identification of resume sections."""
        parser = ResumeParser.__new__(ResumeParser)
        
        text = """Contact Information
        John Doe | john@example.com
        
        Skills
        Python, Java, C++, Machine Learning
        
        Experience
        Senior Developer at TechCorp
        Designed and implemented microservices architecture
        
        Education
        BS in Computer Science
        """
        
        sections = parser.identify_sections(text)
        
        assert "skills" in sections
        assert "experience" in sections
        assert "education" in sections

    def test_parse_resume_convenience_function(self):
        """Test the convenience parse_resume function."""
        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
            temp_file = f.name
            f.write(b"Not a PDF")
        
        try:
            result = parse_resume(temp_file)
            assert result["status"] == "error"
            assert "error" in result
        finally:
            Path(temp_file).unlink()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
