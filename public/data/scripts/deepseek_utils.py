#!/usr/bin/env python3

import os
import json
import logging
from typing import Dict, Any, List, Optional, Union
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Attempt to import GPU-required packages, but provide alternatives if they fail
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
    HAS_GPU_SUPPORT = torch.cuda.is_available()
    logger.info(f"GPU support available: {HAS_GPU_SUPPORT}")
    
    if HAS_GPU_SUPPORT:
        logger.info(f"GPU: {torch.cuda.get_device_name(0)}")
        logger.info(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
except ImportError:
    logger.warning("Could not import torch/transformers. Local DeepSeek model will not be available.")
    HAS_GPU_SUPPORT = False

# Check for API key
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
if DEEPSEEK_API_KEY:
    logger.info("DeepSeek API key found")
else:
    logger.warning("DeepSeek API key not found. DeepSeek API will not be available.")

# Global variables for model and tokenizer
model = None
tokenizer = None

def load_local_model(model_name: str = "deepseek-ai/deepseek-coder-6.7b-instruct") -> bool:
    """
    Load the DeepSeek model locally if hardware supports it.
    
    Args:
        model_name: Name or path of the model to load
        
    Returns:
        bool: Whether model was successfully loaded
    """
    global model, tokenizer
    
    if not HAS_GPU_SUPPORT:
        logger.warning("GPU support not available. Cannot load DeepSeek model locally.")
        return False
    
    try:
        logger.info(f"Loading DeepSeek model: {model_name}")
        
        # For systems with limited VRAM, we'll load with quantization
        if torch.cuda.get_device_properties(0).total_memory < 20 * 1024**3:  # Less than 20GB VRAM
            logger.info("Loading with 4-bit quantization due to limited VRAM")
            import bitsandbytes as bnb
            from transformers import BitsAndBytesConfig
            
            # 4-bit quantization config
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.bfloat16,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_use_double_quant=True
            )
            
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                device_map="auto",
                trust_remote_code=True,
                quantization_config=quantization_config
            )
        else:
            # Load normally with half precision (fp16)
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                device_map="auto",
                trust_remote_code=True,
                torch_dtype=torch.float16
            )
        
        logger.info("Model loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to load DeepSeek model: {e}")
        return False

def query_local_model(prompt: str, max_tokens: int = 1024) -> str:
    """
    Query the local DeepSeek model.
    
    Args:
        prompt: Input prompt text
        max_tokens: Maximum tokens to generate
        
    Returns:
        str: Generated text
    """
    global model, tokenizer
    
    if model is None or tokenizer is None:
        logger.warning("Model not loaded. Attempting to load...")
        success = load_local_model()
        if not success:
            return "Error: Could not load local model. Please use the API instead."
    
    try:
        logger.info("Generating response with local model")
        
        # Format prompt for DeepSeek models
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        # Convert messages to DeepSeek format
        prompt_text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        # Generate response
        inputs = tokenizer(prompt_text, return_tensors="pt").to(model.device)
        outputs = model.generate(
            inputs.input_ids,
            max_new_tokens=max_tokens,
            temperature=0.7,
            top_p=0.9,
        )
        
        # Extract response
        response = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
        return response
    except Exception as e:
        logger.error(f"Error querying local model: {e}")
        return f"Error generating response: {str(e)}"

def query_deepseek_api(prompt: str, max_tokens: int = 1024) -> str:
    """
    Query the DeepSeek API.
    
    Args:
        prompt: Input prompt text
        max_tokens: Maximum tokens to generate
        
    Returns:
        str: Generated text
    """
    if not DEEPSEEK_API_KEY:
        return "Error: DeepSeek API key not found. Please set the DEEPSEEK_API_KEY environment variable."
    
    try:
        import requests
        
        logger.info("Querying DeepSeek API")
        response = requests.post(
            "https://api.deepseek.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}"},
            json={
                "model": "deepseek-coder-6.7b-instruct",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "temperature": 0.7,
            },
            timeout=60
        )
        
        if response.status_code != 200:
            logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
            return f"API Error: {response.status_code} - {response.text}"
        
        result = response.json()
        return result["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"Error querying DeepSeek API: {e}")
        return f"Error: {str(e)}"

def analyze_business_data(bbb_data: Dict[str, Any], reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze business data using either local model or API to get enhanced insights.
    
    Args:
        bbb_data: BBB profile data
        reviews: List of review data
        
    Returns:
        Dict: Business analysis results
    """
    # Prepare sample reviews text
    review_samples = []
    if reviews:
        for i, review in enumerate(reviews[:5]):
            if i >= 5:
                break
            review_text = review.get('review_text', 'No text')
            rating = review.get('rating', 'No rating')
            sentiment = review.get('sentiment', 'No sentiment')
            review_samples.append(f"Review {i+1}: [Rating: {rating}, Sentiment: {sentiment}] {review_text[:200]}...")
    
    review_text = "\n".join(review_samples) if review_samples else "No reviews available"
    
    # Extract business info for the prompt
    business_name = bbb_data.get('business_name', 'Unknown business')
    years_in_business = bbb_data.get('years_in_business', 'Unknown')
    services = bbb_data.get('services', [])
    services_text = ", ".join(services) if services else "Unknown services"
    
    # Prepare prompt for analysis
    prompt = f"""
You are an AI consultant that specializes in analyzing roofing businesses. Please analyze this business data and provide strategic insights:

BUSINESS PROFILE:
Business Name: {business_name}
Years in Business: {years_in_business}
Services: {services_text}
BBB Rating: {bbb_data.get('bbb_rating', 'Unknown')}
Address: {bbb_data.get('address', 'Unknown')}

CUSTOMER REVIEWS:
{review_text}

Based on this data, please provide:

1. Business Personality: What is the personality of this business based on their services and reviews? Provide 3-5 key personality traits.

2. Unique Selling Propositions: What makes this business stand out from competitors? Identify 3 unique selling points.

3. Service Specializations: What services does the business seem to specialize in or excel at based on reviews?

4. Target Customer Demographics: What types of customers would be most interested in this business?

5. Content Strategy: What 3 types of content should this business focus on for their website?

6. Service Guarantees: What guarantees or warranties should this business offer based on their service quality?

7. Local Market Strengths: What unique strengths does this business have in their local market?

Please provide answers in JSON format with these 7 keys.
"""

    # Try local model first, fall back to API if needed
    if HAS_GPU_SUPPORT and (model is not None or load_local_model()):
        logger.info("Using local DeepSeek model for business analysis")
        response = query_local_model(prompt)
    elif DEEPSEEK_API_KEY:
        logger.info("Using DeepSeek API for business analysis")
        response = query_deepseek_api(prompt)
    else:
        logger.warning("No DeepSeek model or API available. Returning default analysis.")
        return {
            "businessPersonality": ["Professional", "Experienced", "Reliable"],
            "uniqueSellingPropositions": [
                "Years of industry experience",
                "Quality workmanship",
                "Customer satisfaction focus"
            ],
            "serviceSpecializations": ["Roof repair", "Roof replacement"],
            "targetCustomerDemographics": ["Homeowners", "Property managers"],
            "contentStrategy": [
                "Before/after project photos",
                "Educational content about roofing materials",
                "Customer testimonials"
            ],
            "serviceGuarantees": ["Workmanship warranty", "Material warranty"],
            "localMarketStrengths": ["Local presence", "Community reputation"]
        }
    
    # Parse the response to JSON
    try:
        # First, check if the response has JSON structure
        if '{' in response and '}' in response:
            # Extract JSON part from the response (in case there's additional text)
            json_str = response[response.find('{'):response.rfind('}')+1]
            result = json.loads(json_str)
            return result
        else:
            # If no JSON structure, parse the text response manually
            logger.warning("Response not in JSON format. Parsing manually.")
            
            sections = {
                "Business Personality": "businessPersonality",
                "Unique Selling Propositions": "uniqueSellingPropositions",
                "Service Specializations": "serviceSpecializations",
                "Target Customer Demographics": "targetCustomerDemographics",
                "Content Strategy": "contentStrategy",
                "Service Guarantees": "serviceGuarantees",
                "Local Market Strengths": "localMarketStrengths"
            }
            
            parsed_result = {}
            
            for section_title, key in sections.items():
                if section_title in response:
                    section_start = response.find(section_title)
                    next_section_starts = [response.find(s, section_start + len(section_title)) 
                                          for s in sections.keys() if s != section_title and s in response[section_start:]]
                    next_section_start = min([s for s in next_section_starts if s > 0], default=len(response))
                    
                    section_text = response[section_start + len(section_title):next_section_start].strip()
                    
                    # Clean up the text and convert to list
                    items = []
                    for line in section_text.split('\n'):
                        line = line.strip()
                        if line and line[0].isdigit() and '. ' in line:
                            items.append(line.split('. ', 1)[1])
                        elif line and not line.startswith('-'):
                            items.append(line)
                    
                    parsed_result[key] = items
                else:
                    parsed_result[key] = ["Information not available"]
            
            return parsed_result
    except Exception as e:
        logger.error(f"Error parsing DeepSeek response: {e}")
        logger.error(f"Raw response: {response}")
        return {
            "businessPersonality": ["Error parsing response"],
            "uniqueSellingPropositions": ["Error parsing response"],
            "serviceSpecializations": ["Error parsing response"],
            "targetCustomerDemographics": ["Error parsing response"],
            "contentStrategy": ["Error parsing response"],
            "serviceGuarantees": ["Error parsing response"],
            "localMarketStrengths": ["Error parsing response"]
        } 