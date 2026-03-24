"""
Resume Parser Module

Handles PDF parsing, text extraction, and formatting cleanup.
Identifies and structures key resume sections.
"""

import logging
import re
from typing import Dict, List, Optional
from pathlib import Path

from pypdf import PdfReader


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class ResumeParser:
    """Parser for extracting and cleaning resume text from PDF files."""

    # Common section headers - case insensitive
    SECTION_KEYWORDS = {
        "skills": [
            "skills",
            "technical skills",
            "core competencies",
            "competencies",
            "expertise",
        ],
        "experience": [
            "experience",
            "work experience",
            "professional experience",
            "employment",
        ],
        "education": [
            "education",
            "academic",
            "education & training",
            "qualifications",
        ],
        "projects": [
            "projects",
            "portfolio",
            "personal projects",
            "key projects",
        ],
        "certifications": [
            "certifications",
            "certificates",
            "licenses",
            "professional certifications",
        ],
    }

    def __init__(self, file_path: str):
        """
        Initialize parser with PDF file path.
        
        Args:
            file_path: Path to PDF resume file
            
        Raises:
            FileNotFoundError: If file does not exist
            ValueError: If file is not a valid PDF
        """
        self.file_path = Path(file_path)
        
        if not self.file_path.exists():
            raise FileNotFoundError(f"Resume file not found: {file_path}")
        
        if self.file_path.suffix.lower() != ".pdf":
            raise ValueError(f"File must be a PDF. Got: {self.file_path.suffix}")
        
        self.raw_text = ""
        self.cleaned_text = ""
        self.sections = {}

    def extract_text(self) -> str:
        """
        Extract raw text from PDF document.
        
        Returns:
            Raw extracted text from all pages
            
        Raises:
            Exception: If PDF cannot be opened or text extraction fails
        """
        try:
            logger.info(f"Opening PDF: {self.file_path}")
            
            with open(self.file_path, 'rb') as pdf_file:
                reader = PdfReader(pdf_file)
                total_pages = len(reader.pages)
                
                logger.info(f"Extracting text from {total_pages} pages")
                
                text_buffer = []
                for page_num, page in enumerate(reader.pages, 1):
                    try:
                        page_text = page.extract_text()
                        if page_text:
                            text_buffer.append(page_text)
                        logger.debug(f"Extracted page {page_num}/{total_pages}")
                    except Exception as e:
                        logger.warning(f"Failed to extract page {page_num}: {e}")
                        continue
                
                self.raw_text = "\n".join(text_buffer)
                logger.info(f"Successfully extracted {len(self.raw_text)} characters")
                
                return self.raw_text
            
        except FileNotFoundError as e:
            logger.error(f"PDF file not found: {e}")
            raise
        except Exception as e:
            logger.error(f"Text extraction failed: {e}")
            raise

    def clean_text(self, raw_text: str) -> str:
        """
        Clean and normalize extracted text.
        
        Handles:
        - Multiple newlines → single newline
        - Extra spaces (tabs, multiple spaces)
        - Special characters cleanup
        - Line continuations
        
        Args:
            raw_text: Raw extracted text
            
        Returns:
            Cleaned and normalized text
        """
        logger.info("Cleaning extracted text")
        text = raw_text
        
        # Handle multiple newlines
        text = re.sub(r"\n\n+", "\n", text)
        
        # Handle tabs and replace with spaces
        text = re.sub(r"\t+", " ", text)
        
        # Clean multiple spaces
        text = re.sub(r"  +", " ", text)
        
        # Fix broken lines (e.g., hyphenated words split across lines)
        text = re.sub(r"-\n", "", text)
        
        # Remove leading/trailing whitespace from each line
        lines = [line.strip() for line in text.split("\n")]
        text = "\n".join(lines)
        
        # Remove completely empty lines
        text = "\n".join(line for line in text.split("\n") if line.strip())
        
        # Normalize unicode characters
        text = text.replace("•", "-")
        text = text.replace("·", "-")
        text = text.replace("○", "-")
        
        self.cleaned_text = text
        logger.info(f"Cleaned text to {len(self.cleaned_text)} characters")
        
        return self.cleaned_text

    def identify_sections(self, text: str) -> Dict[str, str]:
        """
        Identify and extract resume sections.
        
        Args:
            text: Cleaned resume text
            
        Returns:
            Dictionary mapping section names to their content
        """
        logger.info("Identifying resume sections")
        sections = {}
        
        # Create pattern to find section headers
        for section_name, keywords in self.SECTION_KEYWORDS.items():
            pattern = "|".join(keywords)
            # Case-insensitive, word boundary match
            matches = list(re.finditer(rf"\b({pattern})\b", text, re.IGNORECASE))
            
            if matches:
                logger.debug(f"Found section: {section_name}")
                sections[section_name] = matches
        
        # Extract section content
        text_lines = text.split("\n")
        sections_content = {}
        
        for section_name, matches in sections.items():
            section_text = []
            
            # Find all lines that contain section keywords
            for match in matches:
                start_line = text[:match.start()].count("\n")
                
                # Collect from the header line onwards
                for i in range(start_line, len(text_lines)):
                    if i > start_line and any(
                        keyword in text_lines[i].lower()
                        for keywords in self.SECTION_KEYWORDS.values()
                        for keyword in keywords
                    ):
                        # Stop at next section
                        break
                    section_text.append(text_lines[i])
            
            if section_text:
                sections_content[section_name] = "\n".join(section_text).strip()
                logger.debug(
                    f"Section '{section_name}' contains "
                    f"{len(sections_content[section_name])} characters"
                )
        
        self.sections = sections_content
        return sections_content

    def parse(self) -> Dict[str, any]:
        """
        Complete parsing pipeline: extract → clean → identify sections.
        
        Returns:
            Dictionary containing:
            - raw_text: Original extracted text
            - cleaned_text: Processed text
            - sections: Identified resume sections
            - full_text: Complete cleaned text for LLM processing
        """
        try:
            logger.info("Starting resume parsing pipeline")
            
            # Step 1: Extract
            self.extract_text()
            
            # Step 2: Clean
            self.clean_text(self.raw_text)
            
            # Step 3: Identify sections
            self.identify_sections(self.cleaned_text)
            
            result = {
                "status": "success",
                "raw_text": self.raw_text,
                "cleaned_text": self.cleaned_text,
                "sections": self.sections,
                "full_text": self.cleaned_text,  # For LLM analysis
                "file_name": self.file_path.name,
                "sections_found": list(self.sections.keys()),
            }
            
            logger.info(f"Parsing completed successfully. Sections: {result['sections_found']}")
            return result
            
        except Exception as e:
            logger.error(f"Parsing failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "file_name": self.file_path.name,
            }


def parse_resume(file_path: str) -> Dict[str, any]:
    """
    Convenience function to parse a resume PDF.
    
    Args:
        file_path: Path to resume PDF
        
    Returns:
        Parsing result dictionary
    """
    parser = ResumeParser(file_path)
    return parser.parse()
