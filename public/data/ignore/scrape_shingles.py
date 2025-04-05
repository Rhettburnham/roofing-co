from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
from bs4 import BeautifulSoup
import os

# Set up Selenium WebDriver with headless option
options = Options()
options.headless = True
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)

# Navigate to the website
url = 'https://www.homedepot.com/b/Building-Materials-Roofing-Roof-Shingles/N-5yc1vZc5rb'
print(f"Navigating to: {url}")
driver.get(url)
time.sleep(5)  # Allow time for dynamic content to load

# Get the rendered HTML
html_content = driver.page_source
driver.quit()

# Parse HTML with BeautifulSoup
soup = BeautifulSoup(html_content, 'html.parser')

# Extract just the body content
body_content = soup.find('body')

if body_content:
    # Create output directory if it doesn't exist
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raw_data', 'shingles')
    os.makedirs(output_dir, exist_ok=True)
    
    # Save the body content to an HTML file
    output_file = os.path.join(output_dir, 'shingles_body.html')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # Create a minimal HTML structure
        f.write('<!DOCTYPE html>\n<html>\n<head>\n')
        f.write('<meta charset="UTF-8">\n')
        f.write('<title>Home Depot Shingles</title>\n')
        f.write('</head>\n')
        # Write the body content
        f.write(str(body_content))
        f.write('\n</html>')
    
    print(f"Body content extracted and saved to: {output_file}")
else:
    print("Could not extract body content from the page")
