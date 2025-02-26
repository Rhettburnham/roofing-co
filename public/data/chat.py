#!/usr/bin/env python3
# chat.py

import json
import openai
import os

# 1. Set up your OpenAI API key manually for testing purposes
# ⚠️ IMPORTANT: Do NOT hardcode API keys in production environments.
openai.api_key = "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"  # Replace with your test API key

def generate_rich_text_content(filtered_reviews, industry_keywords):
    """
    Generates a comprehensive rich text content including hero text, feature cards,
    about cards, why choose features, and milestone information.

    Args:
        filtered_reviews (list): List of filtered review dictionaries.
        industry_keywords (str): Keywords describing the industry.

    Returns:
        dict: Structured JSON containing all required sections.
    """

    # Convert the 4/5 star reviews into bullet points for GPT context
    positive_text = "\n".join([f"• {r['review_text']}" for r in filtered_reviews])

    # Provide a list of possible Lucide icon names for GPT to choose from
    lucide_icons_list = [
        "Shield", "Award", "Clock", "Home", "Star", "Activity", "CheckCircle",
        "Tool", "Sun", "Moon", "Heart", "Smile", "ThumbsUp", "Layers", "Zap",
        "Send", "Compass", "Globe2", "Package", "Tag", "Target", "Safety"
    ]
    lucide_icons_str = ", ".join(lucide_icons_list)

    # Prompt to generate all necessary sections
    prompt = f"""
You are a creative copywriter for a {industry_keywords} business website. We have 
a RichTextSection, AboutSection, and WhyChooseSection that need the following text, based on these 4- and 5-star reviews:

Reviews:
{positive_text}

We need JSON output with the following structure:

{{
  "heroText": "Concise hero text (~1-2 sentences).",
  "cards": [
    {{
      "title": "Short title",
      "desc": "Description",
      "icon": "IconName"
    }},
    ... (total 4 cards)
  ],
  "yearsOfExcellenceTitle": "Milestone title",
  "yearsOfExcellenceDesc": "Milestone description.",
  
  "aboutCards": [
    {{
      "title": "Short title",
      "desc": "Description",
      "icon": "IconName"
    }},
    ... (total 6 about cards)
  ],
  
  "whyChooseFeatures": [
    {{
      "title": "Feature title",
      "desc": "Description",
      "icon": "IconName"
    }},
    ... (total 4 features)
  ]
}}

Instructions:
- All icon names must be chosen from the following list: {lucide_icons_str}
- Ensure the JSON is valid with double quotes and no extra keys.
- Keep the content concise, direct, and creative.
- Summarize only from the provided reviews and industry context.
- Do not include any additional commentary or explanations.
- Respond ONLY with the JSON structure as specified.
"""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a creative copywriter."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )

        # Extract the assistant's response
        rich_text_json_str = response.choices[0].message.content.strip()

        # Attempt to parse the JSON
        rich_text_content = json.loads(rich_text_json_str)
        return rich_text_content

    except Exception as e:
        print(f"Error generating or parsing rich text JSON: {e}")

        # Fallback content in case of error
        return {
            "heroText": "Welcome to Our Roofing Business! We’re proud to serve you with top-quality craftsmanship and customer care.",
            "cards": [
                {
                    "title": "Quality Service",
                    "desc": "We ensure top-notch workmanship every time.",
                    "icon": "Shield"
                },
                {
                    "title": "Fast Response",
                    "desc": "Quick turnarounds, even in emergencies.",
                    "icon": "Clock"
                },
                {
                    "title": "Trusted Experts",
                    "desc": "Highly skilled, certified local professionals.",
                    "icon": "Award"
                },
                {
                    "title": "Happy Customers",
                    "desc": "We take pride in our strong community ties.",
                    "icon": "Home"
                }
            ],
            "yearsOfExcellenceTitle": "25+ Years of Excellence",
            "yearsOfExcellenceDesc": "Over two decades of reliable, high-quality roofing solutions.",
            "aboutCards": [
                {
                    "title": "Our Mission",
                    "desc": "Deliver exceptional roofing services with integrity.",
                    "icon": "Heart"
                },
                {
                    "title": "Our Vision",
                    "desc": "To be the leading roofing company in the region.",
                    "icon": "Sun"
                },
                {
                    "title": "Our Values",
                    "desc": "Commitment, Excellence, and Customer Satisfaction.",
                    "icon": "ThumbsUp"
                }
            ],
            "whyChooseFeatures": [
                {
                    "title": "Reliability",
                    "desc": "Dependable services you can trust.",
                    "icon": "CheckCircle"
                },
                {
                    "title": "Premium Materials",
                    "desc": "We use only the best materials for durability.",
                    "icon": "Tool"
                },
                {
                    "title": "Warranty",
                    "desc": "Comprehensive warranties on all projects.",
                    "icon": "Shield"
                },
                {
                    "title": "Safety First",
                    "desc": "Strict safety protocols to protect our team and your property.",
                    "icon": "Safety"
                }
            ]
        }

def main():
    """
    Main function to process reviews and generate richText.json.
    """
    try:
        # Manual input for industry keywords
        industry_keywords = "roofing"  # Adjust this as needed

        # Path to the sentiments_reviews.json file
        input_file = "./sentiment_reviews.json"  # Update the path as necessary

        # Load and parse the sentiments_reviews.json file
        with open(input_file, "r", encoding="utf-8") as f:
            reviews_data = json.load(f)

        # Ensure the data is a list
        if not isinstance(reviews_data, list):
            raise ValueError("The JSON data must be an array of reviews.")

        # Filter reviews for 4- and 5-star ratings
        filtered_reviews = [review for review in reviews_data if int(review.get("rating", 0)) >= 4]

        print(f"Total 4 and 5-star reviews: {len(filtered_reviews)}")

        if not filtered_reviews:
            print("No 4 or 5-star reviews found. Using fallback content.")

        # Generate the rich text content
        rich_text_content = generate_rich_text_content(filtered_reviews, industry_keywords)

        # Define the output path
        output_dir = os.path.join("public", "data")
        os.makedirs(output_dir, exist_ok=True)
        output_file = os.path.join(output_dir, "richText.json")

        # Write the JSON to richText.json
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(rich_text_content, f, indent=2, ensure_ascii=False)

        print(f"Rich text section content has been saved to {output_file}")

    except Exception as e:
        print(f"Error processing reviews: {e}")

if __name__ == "__main__":
    main()
