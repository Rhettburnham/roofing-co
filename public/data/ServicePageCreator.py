#!/usr/bin/env python3
# chat_example.py

import openai
import os
import json

openai.api_key = os.getenv("OPENAI_API_KEY")  # store your key in an env var

def create_pages_with_prompt():
    # 1. Provide short references for GPT to read
    reference_blocks_code = """
HeroBlock (props: { config, readOnly, onConfigChange }) => {
  // Fields in config:
  //   backgroundImage, title, shrinkAfterMs, initialHeight, finalHeight
  // readOnly => final 'live' version with shrink effect
}

PricingGrid (props: { config, readOnly, onConfigChange }) => {
  // config.showPrice?: boolean
  // config.items?: array of { title, image, alt, description, rate }
}

// ... add references for the other blocks if desired
"""

    # 2. Ask GPT to produce six pages named page1..page6 using your new HeroBlock & any blocks
    user_prompt = f"""
You are an assistant that creates sample React pages using my HeroBlock and PricingGrid references. 
Please produce six separate JSX components named page1, page2, page3, page4, page5, and page6. 
Each page uses the new HeroBlock (with shrink effect) plus optionally any other blocks. 
Make the text relevant to a roofing or construction context. 
Output the code all together, as if I had 6 separate .jsx files. 
No extra commentary—just the final code.

Block references:
{reference_blocks_code}
"""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a code generator that outputs only valid JSX."},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=1500
        )

        # 3. Print GPT’s answer
        answer = response.choices[0].message.content
        print("GPT's answer:\n", answer)

        # (Optionally, parse or store answer in local files)
        # e.g. parse out sections for page1..page6
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")

if __name__ == "__main__":
    create_pages_with_prompt()
