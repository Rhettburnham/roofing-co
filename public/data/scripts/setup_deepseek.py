#!/usr/bin/env python3

import os
import sys
import subprocess
import platform
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Find the root directory (where .env should be)
def find_root_dir():
    current_dir = Path(__file__).resolve().parent
    while current_dir.parent.name:
        if (current_dir / '.env').exists():
            return current_dir
        current_dir = current_dir.parent
    return None

# Load environment variables from root .env file
root_dir = find_root_dir()
if root_dir:
    env_path = root_dir / '.env'
    logger.info(f"Found .env file at: {env_path}")
    from dotenv import load_dotenv
    load_dotenv(env_path)
else:
    logger.warning("No .env file found in root directory")

def check_gpu():
    """Check if a CUDA-compatible GPU is available"""
    try:
        import torch
        has_cuda = torch.cuda.is_available()
        if has_cuda:
            gpu_name = torch.cuda.get_device_name(0)
            vram_mb = torch.cuda.get_device_properties(0).total_memory / (1024 * 1024)
            logger.info(f"Found GPU: {gpu_name} with {vram_mb:.0f} MB VRAM")
            return True, gpu_name, vram_mb
        else:
            logger.warning("No CUDA-compatible GPU found")
            return False, None, 0
    except ImportError:
        logger.warning("PyTorch not installed, can't check GPU")
        return False, None, 0
    except Exception as e:
        logger.error(f"Error checking GPU: {e}")
        return False, None, 0

def install_dependencies(cuda_version=None):
    """Install required dependencies"""
    # Base dependencies
    base_deps = [
        "python-dotenv",
        "requests",
        "tqdm",
        "colorama"
    ]
    
    # PyTorch with CUDA if available
    pytorch_cmd = ["pip", "install", "torch", "torchvision", "torchaudio"]
    if cuda_version:
        if cuda_version >= 11.8:
            pytorch_cmd.append("--extra-index-url")
            pytorch_cmd.append("https://download.pytorch.org/whl/cu118")
        elif cuda_version >= 11.6:
            pytorch_cmd.append("--extra-index-url")
            pytorch_cmd.append("https://download.pytorch.org/whl/cu116")
    
    # Transformers and related packages
    transformers_deps = [
        "transformers>=4.31.0",
        "accelerate>=0.20.0",
        "bitsandbytes>=0.41.0",
        "scipy",
        "sentencepiece",
        "protobuf"
    ]
    
    # Install base dependencies
    logger.info("Installing base dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install"] + base_deps)
    
    # Install PyTorch
    logger.info("Installing PyTorch...")
    try:
        subprocess.check_call(pytorch_cmd)
    except subprocess.CalledProcessError:
        logger.warning("Failed to install PyTorch with CUDA, falling back to CPU version")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "torch", "torchvision", "torchaudio"])
    
    # Install transformers and related packages
    logger.info("Installing transformers and related packages...")
    subprocess.check_call([sys.executable, "-m", "pip", "install"] + transformers_deps)
    
    logger.info("All dependencies installed successfully")

def detect_cuda_version():
    """Detect CUDA version installed on the system"""
    # Windows
    if platform.system() == "Windows":
        try:
            # Check for nvcc version
            result = subprocess.run(["nvcc", "--version"], capture_output=True, text=True)
            version_line = result.stdout.split("\n")[4]
            version = version_line.split("release ")[1].split(",")[0]
            return float(version)
        except:
            # Check for CUDA path
            for cuda_dir in [f"C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v{v}" for v in ["12.2", "12.1", "12.0", "11.8", "11.7", "11.6"]]:
                if os.path.exists(cuda_dir):
                    return float(cuda_dir.split("v")[1])
            return None
    
    # Linux
    elif platform.system() == "Linux":
        try:
            result = subprocess.run(["nvcc", "--version"], capture_output=True, text=True)
            version_line = [line for line in result.stdout.split("\n") if "release" in line][0]
            version = version_line.split("release ")[1].split(",")[0]
            return float(version)
        except:
            return None
    
    # MacOS or other systems - CUDA not supported
    return None

def create_env_file():
    """Create .env file for DeepSeek configuration"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_template_path = os.path.join(script_dir, ".env.deepseek")
    env_path = os.path.join(script_dir, ".env")
    
    if not os.path.exists(env_template_path):
        logger.warning(".env.deepseek template not found. Creating minimal .env file.")
        with open(env_path, "w") as f:
            f.write("# DeepSeek configuration\n")
            f.write("DEEPSEEK_API_KEY=\n")
            f.write("MODEL_NAME=deepseek-ai/deepseek-coder-6.7b-instruct\n")
    else:
        # Copy template to .env
        with open(env_template_path, "r") as template:
            with open(env_path, "w") as env_file:
                env_file.write(template.read())
    
    logger.info(f".env file created at {env_path}")
    logger.info("Please update it with your DeepSeek API key if you plan to use the API.")

def test_deepseek_utils():
    """Test if DeepSeek utilities can be imported"""
    try:
        from deepseek_utils import analyze_business_data
        logger.info("DeepSeek utilities imported successfully!")
        return True
    except ImportError as e:
        logger.error(f"Failed to import DeepSeek utilities: {e}")
        return False

def main():
    """Main setup function"""
    logger.info("Starting DeepSeek setup...")
    
    # Check GPU
    has_gpu, gpu_name, vram_mb = check_gpu()
    
    # Detect CUDA version
    cuda_version = detect_cuda_version() if has_gpu else None
    
    if cuda_version:
        logger.info(f"Detected CUDA version: {cuda_version}")
    elif has_gpu:
        logger.warning("GPU found but CUDA version could not be detected")
    
    # Install dependencies
    try:
        install_dependencies(cuda_version)
    except Exception as e:
        logger.error(f"Error installing dependencies: {e}")
        logger.error("Setup failed. Please try to install dependencies manually.")
        return
    
    # Create .env file
    create_env_file()
    
    # Test DeepSeek utilities
    test_result = test_deepseek_utils()
    
    if test_result:
        logger.info("DeepSeek setup completed successfully!")
    else:
        logger.warning("DeepSeek setup completed with warnings. Check the logs for details.")
    
    # Provide recommendations based on GPU
    if has_gpu:
        if vram_mb >= 24000:  # 24GB or more
            logger.info("Your GPU has sufficient VRAM for full DeepSeek models.")
            logger.info("You can use the 33B model for best results.")
        elif vram_mb >= 12000:  # 12GB or more
            logger.info("Your GPU can run the 6.7B model with full precision.")
            logger.info("For larger models, 4-bit quantization will be used automatically.")
        elif vram_mb >= 8000:  # 8GB or more
            logger.info("Your GPU can run the 6.7B model with 4-bit quantization.")
            logger.info("The model will run slower but should work correctly.")
        else:
            logger.warning(f"Your GPU has only {vram_mb:.0f} MB VRAM, which may not be enough.")
            logger.warning("Consider using the DeepSeek API instead of local models.")
    else:
        logger.warning("No GPU detected. DeepSeek models can only run on the CPU, which will be very slow.")
        logger.warning("We recommend using the DeepSeek API instead.")

if __name__ == "__main__":
    main() 