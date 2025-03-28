from deepseek_utils import query_deepseek_api
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.deepseek')

def main():
    print("Testing DeepSeek API connection...")
    
    api_key = os.getenv('DEEPSEEK_API_KEY')
    if not api_key or api_key == 'your_api_key_here':
        print("API key not set. Please update the .env.deepseek file with your API key.")
        return
    
    print("API key found. Testing connection...")
    response = query_deepseek_api("Write a simple Python function to say hello world.")
    
    print("\nAPI Response:")
    print(response)

if __name__ == "__main__":
    main() 