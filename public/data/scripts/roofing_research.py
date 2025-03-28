#!/usr/bin/env python3

import os
import json
import logging
import time
from typing import List, Dict, Any
from dotenv import load_dotenv
from deepseek_utils import query_deepseek_api

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv('.env')

class RoofingResearcher:
    """
    Class to conduct deep research on roofing businesses using the DeepSeek API.
    Focused on generating website content insights from BBB profiles and reviews.
    """
    
    def __init__(self, bbb_profile_path: str, reviews_path: str, leads_path: str = None):
        """Initialize with paths to various data sources."""
        self.api_key = os.getenv('DEEPSEEK_API_KEY')
        if not self.api_key:
            raise ValueError("DeepSeek API key not found. Please set DEEPSEEK_API_KEY in .env")
        
        # Load BBB profile data
        self.bbb_profile = self._load_json(bbb_profile_path)
        
        # Load reviews
        self.reviews = self._load_json(reviews_path)
        
        # Load leads data if available
        self.leads_data = self._load_json(leads_path) if leads_path else {}
        
        # Store conversation history
        self.conversation_history = []
        
        # Output files
        self.insights_file = "roofing_business_insights.json"
        self.considerations_file = "business_owner_considerations.txt"
    
    def _load_json(self, filepath: str) -> Dict[str, Any]:
        """Load and return JSON data from file."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"File not found: {filepath}")
            return {}
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON in file: {filepath}")
            return {}
    
    def _save_research(self, data: Dict[str, Any]):
        """Save research insights to JSON file."""
        with open(self.insights_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        logger.info(f"Research saved to {self.insights_file}")
    
    def _save_considerations(self, text: str):
        """Save business owner considerations to text file."""
        with open(self.considerations_file, 'w', encoding='utf-8') as f:
            f.write(text)
        logger.info(f"Considerations saved to {self.considerations_file}")
    
    def _extract_business_summary(self) -> str:
        """Create a concise summary of the business from the BBB profile data."""
        business_name = self.bbb_profile.get('business_name', 'Unknown Business')
        years = self.bbb_profile.get('years_in_business', 'Unknown Years')
        if isinstance(years, str) and "Years in Business: " in years:
            years = years.strip("Years in Business: ")
        rating = self.bbb_profile.get('bbb_rating', 'Unknown Rating')
        address = self.bbb_profile.get('address', 'Unknown Address')
        phone = self.bbb_profile.get('telephone', 'Unknown Phone')
        website = self.bbb_profile.get('website', 'No Website')
        
        # Try to get services as a formatted string
        services = []
        if 'services' in self.bbb_profile and isinstance(self.bbb_profile['services'], list):
            services = self.bbb_profile['services']
        elif 'services' in self.bbb_profile and isinstance(self.bbb_profile['services'], str):
            services = [self.bbb_profile['services']]
            
        if 'additional_services' in self.bbb_profile and isinstance(self.bbb_profile['additional_services'], list):
            services.extend(self.bbb_profile['additional_services'])
            
        services_text = "; ".join(services) if services else "Unknown Services"
        
        # Get employee information if available
        employees = []
        if 'employee_names' in self.bbb_profile and isinstance(self.bbb_profile['employee_names'], list):
            employees = self.bbb_profile['employee_names']
        employee_text = "\n".join([f"- {emp}" for emp in employees]) if employees else "Unknown"
        
        return f"""
        Business Name: {business_name}
        Years in Business: {years}
        BBB Rating: {rating}
        Address: {address}
        Phone: {phone}
        Website: {website}
        
        Services Offered:
        {services_text}
        
        Employees:
        {employee_text}
        """
    
    def _extract_review_summary(self, limit: int = 8) -> str:
        """Create a summary of top reviews with sentiment analysis."""
        if not self.reviews:
            return "No reviews available."
        
        summary = []
        for i, review in enumerate(self.reviews[:limit]):
            name = review.get('name', 'Anonymous')
            rating = review.get('rating', 'N/A')
            review_text = review.get('review_text', 'No comment')
            sentiment = review.get('sentiment', 'neutral')
            polarity = review.get('polarity', 0.0)
            
            summary.append(f"Review {i+1}: [Rating: {rating}, Sentiment: {sentiment}, Polarity: {polarity}] \"{review_text[:200]}...\"" if len(review_text) > 200 else f"Review {i+1}: [Rating: {rating}, Sentiment: {sentiment}, Polarity: {polarity}] \"{review_text}\"")
        
        return "\n".join(summary)
    
    def generate_initial_questions(self) -> List[str]:
        """Generate initial research questions focused on website content development."""
        business_summary = self._extract_business_summary()
        review_summary = self._extract_review_summary(limit=5)
        
        prompt = f"""
        As a website content strategist specializing in roofing businesses, I need to generate thoughtful questions about this roofing business to develop compelling website content.
        
        BUSINESS INFORMATION:
        {business_summary}
        
        CUSTOMER REVIEWS:
        {review_summary}
        
        Please generate 10 strategic questions focused on website content development for this specific roofing business. 
        Focus on aspects like:
        1. Value proposition and unique selling points for the website homepage
        2. Service page content strategy based on their specializations
        3. Customer testimonial presentation based on sentiment analysis
        4. About page content highlighting business personality and history
        5. Local market targeting and geographical service area definition
        6. Call-to-action and lead generation strategies
        7. Visual content and imagery recommendations
        8. Missing information that would improve the website's effectiveness
        
        Format your response as a numbered list with just the questions.
        """
        
        response = query_deepseek_api(prompt)
        self.conversation_history.append({"role": "user", "content": prompt})
        self.conversation_history.append({"role": "assistant", "content": response})
        
        # Parse questions from response
        questions = []
        for line in response.split('\n'):
            line = line.strip()
            if line and (line[0].isdigit() and '. ' in line):
                question = line.split('. ', 1)[1].strip()
                questions.append(question)
        
        return questions
    
    def research_question(self, question: str) -> Dict[str, Any]:
        """Research a specific website content question using business data and reviews."""
        business_summary = self._extract_business_summary()
        review_summary = self._extract_review_summary()
        
        prompt = f"""
        As a website content developer for roofing businesses, I'm researching this question about a specific roofing company:
        
        QUESTION: {question}
        
        BUSINESS INFORMATION:
        {business_summary}
        
        CUSTOMER REVIEWS:
        {review_summary}
        
        Please provide:
        1. A detailed answer to the question, specifically focused on website content (300-500 words)
        2. 3-5 key content elements or sections that should be included on the website based on this research
        3. 2-3 specific content recommendations (text snippets, headings, or calls-to-action) that could be used verbatim
        
        Format your response as a JSON with these keys: "answer", "contentElements" (array), and "contentSnippets" (array).
        """
        
        response = query_deepseek_api(prompt)
        self.conversation_history.append({"role": "user", "content": prompt})
        self.conversation_history.append({"role": "assistant", "content": response})
        
        # Parse JSON response
        try:
            # Extract JSON part from the response (in case there's additional text)
            if '{' in response and '}' in response:
                json_str = response[response.find('{'):response.rfind('}')+1]
                return json.loads(json_str)
            else:
                logger.warning("Response not in JSON format")
                return {
                    "answer": response,
                    "contentElements": ["Could not parse structured content elements"],
                    "contentSnippets": ["Could not parse structured content snippets"]
                }
        except json.JSONDecodeError:
            logger.error("Could not parse JSON response")
            return {
                "answer": response,
                "contentElements": ["Could not parse structured content elements"],
                "contentSnippets": ["Could not parse structured content snippets"]
            }
    
    def generate_follow_up_questions(self, previous_research: Dict[str, Any]) -> List[str]:
        """Generate follow-up questions based on previous website content research."""
        content_elements = previous_research.get("contentElements", [])
        content_snippets = previous_research.get("contentSnippets", [])
        
        elements_text = "\n".join([f"- {element}" for element in content_elements])
        snippets_text = "\n".join([f"- {snippet}" for snippet in content_snippets])
        
        prompt = f"""
        Based on the following content elements and snippets for a roofing business website, 
        please generate 5 follow-up questions that would help us develop more detailed website content:
        
        PROPOSED CONTENT ELEMENTS:
        {elements_text}
        
        PROPOSED CONTENT SNIPPETS:
        {snippets_text}
        
        Generate 5 specific follow-up questions that would help us create more detailed and compelling website content.
        Focus on aspects like specific page sections, visual elements, customer journey touchpoints, or calls-to-action.
        Format as a numbered list with just the questions.
        """
        
        response = query_deepseek_api(prompt)
        self.conversation_history.append({"role": "user", "content": prompt})
        self.conversation_history.append({"role": "assistant", "content": response})
        
        # Parse questions from response
        questions = []
        for line in response.split('\n'):
            line = line.strip()
            if line and (line[0].isdigit() and '. ' in line):
                question = line.split('. ', 1)[1].strip()
                questions.append(question)
        
        return questions
    
    def synthesize_website_content(self, all_research: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Synthesize all research into a comprehensive website content plan."""
        # Combine all content elements and snippets
        all_content_elements = []
        all_content_snippets = []
        
        for question, research in all_research.items():
            all_content_elements.extend(research.get("contentElements", []))
            all_content_snippets.extend(research.get("contentSnippets", []))
        
        elements_text = "\n".join([f"- {element}" for element in all_content_elements])
        snippets_text = "\n".join([f"- {snippet}" for snippet in all_content_snippets])
        
        prompt = f"""
        I'm creating a comprehensive website content plan for a roofing business based on extensive research.
        Please synthesize the following content elements and snippets into a cohesive website content strategy:
        
        BUSINESS INFORMATION:
        {self._extract_business_summary()}
        
        CONTENT ELEMENTS FROM RESEARCH:
        {elements_text}
        
        CONTENT SNIPPETS FROM RESEARCH:
        {snippets_text}
        
        Please provide:
        
        1. A website content strategy summary (150-250 words)
        
        2. Homepage content recommendations including:
           - Hero section headline and subheadline
           - 3-4 key benefit statements
           - Primary call-to-action text
           
        3. Services page content including:
           - Main services headline
           - 4-6 service descriptions (name and 1-2 sentence description for each)
           - Service benefits section
           
        4. About page content including:
           - Company story narrative (2-3 paragraphs)
           - Team/owner description
           - Company values or mission statement
           
        5. Testimonials/reviews section including:
           - Section headline
           - 3-4 formatted customer testimonials extracted from reviews
           
        6. Contact page content including:
           - Contact form headline
           - Service area description
           - Contact information presentation
           
        Format your response as a JSON with keys matching these six sections.
        """
        
        response = query_deepseek_api(prompt, max_tokens=2000)
        
        # Parse JSON response
        try:
            # Extract JSON part from the response
            if '{' in response and '}' in response:
                json_str = response[response.find('{'):response.rfind('}')+1]
                return json.loads(json_str)
            else:
                logger.warning("Synthesis response not in JSON format")
                return {"error": "Could not parse structured content synthesis", "rawResponse": response}
        except json.JSONDecodeError:
            logger.error("Could not parse JSON in synthesis response")
            return {"error": "Could not parse JSON synthesis", "rawResponse": response}
    
    def generate_business_owner_considerations(self) -> str:
        """Generate considerations and commentary for the business owner."""
        business_summary = self._extract_business_summary()
        review_summary = self._extract_review_summary(limit=3)
        
        prompt = f"""
        As a website development consultant, I need to provide important considerations to a roofing business owner
        about their website content and online presence. Please analyze this business information and reviews:
        
        BUSINESS INFORMATION:
        {business_summary}
        
        SAMPLE REVIEWS:
        {review_summary}
        
        Please provide a detailed list of considerations for the business owner that addresses:
        
        1. Important information that appears to be missing from the available data that should be added to the website
        2. Potential concerns or challenges based on the reviews that should be addressed on the website
        3. Opportunities to differentiate from competitors based on the available information
        4. Recommendations for additional content or features that would improve lead generation
        5. Suggestions for visual content (types of photos, videos, etc.) that would enhance the website
        6. Local SEO considerations specific to this business and location
        
        Format your response as a detailed text document with clear sections and bullet points.
        Use a professional, consultative tone that speaks directly to the business owner.
        """
        
        response = query_deepseek_api(prompt, max_tokens=1500)
        return response
    
    def run_research(self, num_iterations: int = 2) -> Dict[str, Any]:
        """Run the full website content research process with multiple iterations of questions."""
        logger.info("Starting roofing business website content research...")
        
        # Generate initial questions
        questions = self.generate_initial_questions()
        logger.info(f"Generated {len(questions)} initial content questions")
        
        all_research = {}
        
        # First iteration: research initial questions
        for i, question in enumerate(questions[:5]):  # Limit to first 5 questions
            logger.info(f"Researching content question {i+1}: {question}")
            research = self.research_question(question)
            all_research[question] = research
            time.sleep(1)  # Avoid rate limiting
        
        # Additional iterations with follow-up questions
        for iteration in range(1, num_iterations):
            logger.info(f"Starting iteration {iteration+1}")
            follow_up_questions = []
            
            # Generate follow-up questions based on previous research
            for question, research in list(all_research.items())[:2]:  # Use first 2 researched questions
                new_questions = self.generate_follow_up_questions(research)
                follow_up_questions.extend(new_questions[:2])  # Take first 2 follow-up questions
            
            # Research follow-up questions
            for i, question in enumerate(follow_up_questions[:4]):  # Limit to 4 follow-up questions
                logger.info(f"Researching follow-up content question {i+1}: {question}")
                research = self.research_question(question)
                all_research[question] = research
                time.sleep(1)  # Avoid rate limiting
        
        # Synthesize all research into website content plan
        logger.info("Synthesizing website content plan...")
        content_plan = self.synthesize_website_content(all_research)
        
        # Generate business owner considerations
        logger.info("Generating business owner considerations...")
        considerations = self.generate_business_owner_considerations()
        self._save_considerations(considerations)
        
        # Save both detailed research and content plan
        final_output = {
            "detailedResearch": all_research,
            "websiteContentPlan": content_plan
        }
        self._save_research(final_output)
        
        return final_output

def main():
    try:
        # File paths
        bbb_profile_path = "../bbb_profile_data.json"
        reviews_path = "../sentiment_reviews.json"
        
        # Create researcher and run research
        researcher = RoofingResearcher(bbb_profile_path, reviews_path)
        research = researcher.run_research(num_iterations=2)
        
        print("\n---- Website Content Research Complete ----")
        print(f"Results saved to {researcher.insights_file}")
        print(f"Business owner considerations saved to {researcher.considerations_file}")
        
        # Print content strategy summary if available
        if "websiteContentPlan" in research and "1" in research["websiteContentPlan"]:
            print("\n---- Website Content Strategy Summary ----")
            print(research["websiteContentPlan"]["1"])
    
    except Exception as e:
        logger.error(f"Error running website content research: {e}")
        print(f"Error: {e}")

if __name__ == "__main__":
    main() 