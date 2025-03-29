from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from chromedriver_py import binary_path  # this will get you the path to the binary
from selenium.webdriver.chrome.options import Options

def test_chromedriver():
    """Test if ChromeDriver works properly with different approaches."""
    print("Testing ChromeDriver...")
    
    # Method 1: Using webdriver-manager
    try:
        print("\nMethod 1: Using webdriver-manager")
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=chrome_options
        )
        
        driver.get("https://www.google.com")
        print(f"Title: {driver.title}")
        driver.quit()
        print("Method 1 successful!")
    except Exception as e:
        print(f"Method 1 failed: {e}")
    
    # Method 2: Using chromedriver-py
    try:
        print("\nMethod 2: Using chromedriver-py")
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        driver = webdriver.Chrome(
            service=Service(binary_path),
            options=chrome_options
        )
        
        driver.get("https://www.google.com")
        print(f"Title: {driver.title}")
        driver.quit()
        print("Method 2 successful!")
    except Exception as e:
        print(f"Method 2 failed: {e}")

if __name__ == "__main__":
    test_chromedriver() 