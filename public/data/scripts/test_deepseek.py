#!/usr/bin/env python3

import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_model_loading():
    print("Testing DeepSeek model loading...")
    
    # Check CUDA availability
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    
    # Model configuration
    model_name = os.getenv("MODEL_NAME", "deepseek-ai/deepseek-coder-6.7b-instruct")
    print(f"\nLoading model: {model_name}")
    
    try:
        # 4-bit quantization config
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.bfloat16,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True
        )
        
        # Load tokenizer
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        # Load model
        print("Loading model...")
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            device_map="auto",
            trust_remote_code=True,
            quantization_config=quantization_config
        )
        
        print("\nModel loaded successfully!")
        
        # Test inference
        print("\nTesting inference...")
        test_prompt = "Write a simple Python function to calculate the factorial of a number."
        inputs = tokenizer(test_prompt, return_tensors="pt").to(model.device)
        
        outputs = model.generate(
            inputs.input_ids,
            max_new_tokens=100,
            temperature=0.7,
            top_p=0.9,
        )
        
        response = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
        print("\nTest prompt:", test_prompt)
        print("\nModel response:", response)
        
        return True
        
    except Exception as e:
        print(f"\nError loading model: {str(e)}")
        return False

if __name__ == "__main__":
    test_model_loading() 