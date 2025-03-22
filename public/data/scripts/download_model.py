from deepseek_utils import load_local_model, query_local_model

def main():
    print("Starting DeepSeek model download and test...")
    
    # Try to load the model
    print("Loading model...")
    success = load_local_model()
    
    if success:
        print("Model loaded successfully!")
        
        # Test the model with a simple prompt
        print("\nTesting model with a simple prompt...")
        test_prompt = "Write a simple Python function to add two numbers."
        response = query_local_model(test_prompt, max_tokens=100)
        print("\nModel response:")
        print(response)
    else:
        print("Failed to load model. Please check your GPU and system requirements.")

if __name__ == "__main__":
    main() 