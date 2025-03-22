#!/usr/bin/env python3

import os
import sys
import json
import logging
import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime
import subprocess
from typing import Dict, Any, Optional
import threading
import queue

# Configure logging
log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(log_dir, f'website_generator_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class WebsiteGeneratorGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Roofing Website Generator")
        self.root.geometry("600x800")
        
        # Create a queue for log messages
        self.log_queue = queue.Queue()
        
        self.setup_gui()
        self.setup_logging()
        
    def setup_gui(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Input fields
        ttk.Label(main_frame, text="BBB Profile URL:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.bbb_url = ttk.Entry(main_frame, width=50)
        self.bbb_url.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        ttk.Label(main_frame, text="Google Reviews URL:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.google_url = ttk.Entry(main_frame, width=50)
        self.google_url.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        # Progress section
        ttk.Label(main_frame, text="Progress:").grid(row=4, column=0, sticky=tk.W, pady=10)
        self.progress = ttk.Progressbar(main_frame, length=400, mode='determinate')
        self.progress.grid(row=5, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        # Status label
        self.status_label = ttk.Label(main_frame, text="Ready to start")
        self.status_label.grid(row=6, column=0, columnspan=2, pady=5)
        
        # Log display
        log_frame = ttk.LabelFrame(main_frame, text="Log Output", padding="5")
        log_frame.grid(row=7, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=10)
        
        self.log_text = tk.Text(log_frame, height=20, width=70)
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        scrollbar = ttk.Scrollbar(log_frame, orient=tk.VERTICAL, command=self.log_text.yview)
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        self.log_text['yscrollcommand'] = scrollbar.set
        
        # Buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=8, column=0, columnspan=2, pady=10)
        
        self.start_button = ttk.Button(button_frame, text="Start Generation", command=self.start_generation)
        self.start_button.grid(row=0, column=0, padx=5)
        
        self.cancel_button = ttk.Button(button_frame, text="Cancel", command=self.cancel_generation, state=tk.DISABLED)
        self.cancel_button.grid(row=0, column=1, padx=5)
        
    def setup_logging(self):
        # Create a handler that uses the queue
        queue_handler = QueueHandler(self.log_queue)
        logger.addHandler(queue_handler)
        
        # Start the timer to check the queue
        self.root.after(100, self.check_log_queue)
    
    def check_log_queue(self):
        """Check for new log records"""
        while True:
            try:
                record = self.log_queue.get_nowait()
                self.log_text.insert(tk.END, record + '\n')
                self.log_text.see(tk.END)
            except queue.Empty:
                break
        self.root.after(100, self.check_log_queue)
    
    def update_status(self, message: str, progress: int):
        """Update status label and progress bar"""
        self.status_label['text'] = message
        self.progress['value'] = progress
        self.root.update_idletasks()
    
    def start_generation(self):
        """Start the website generation process"""
        bbb_url = self.bbb_url.get().strip()
        google_url = self.google_url.get().strip()
        
        if not bbb_url or not google_url:
            messagebox.showerror("Error", "Please enter both BBB Profile and Google Reviews URLs")
            return
        
        # Disable input and start button
        self.bbb_url['state'] = 'disabled'
        self.google_url['state'] = 'disabled'
        self.start_button['state'] = 'disabled'
        self.cancel_button['state'] = 'normal'
        
        # Start generation in a separate thread
        self.generator_thread = threading.Thread(
            target=self.run_generation_process,
            args=(bbb_url, google_url)
        )
        self.generator_thread.start()
    
    def cancel_generation(self):
        """Cancel the generation process"""
        if hasattr(self, 'generator_thread') and self.generator_thread.is_alive():
            # Set a flag to stop the process
            self.stop_generation = True
            self.update_status("Cancelling...", self.progress['value'])
    
    def run_generation_process(self, bbb_url: str, google_url: str):
        """Run the entire generation process"""
        try:
            self.stop_generation = False
            script_dir = os.path.dirname(os.path.abspath(__file__))
            
            # Step 1: Scrape BBB Profile (20%)
            self.update_status("Scraping BBB Profile...", 0)
            subprocess.run([
                sys.executable,
                os.path.join(script_dir, "ScrapeBBB.py"),
                "--url", bbb_url
            ], check=True)
            if self.stop_generation: return
            
            # Step 2: Scrape Google Reviews (40%)
            self.update_status("Scraping Google Reviews...", 20)
            subprocess.run([
                sys.executable,
                os.path.join(script_dir, "ScrapeReviews.py"),
                "--url", google_url
            ], check=True)
            if self.stop_generation: return
            
            # Step 3: Process Reviews (60%)
            self.update_status("Processing Reviews...", 40)
            subprocess.run([
                sys.executable,
                os.path.join(script_dir, "AnalyzeReviews.py")
            ], check=True)
            if self.stop_generation: return
            
            # Step 4: Generate Research (80%)
            self.update_status("Generating Research...", 60)
            subprocess.run([
                sys.executable,
                os.path.join(script_dir, "roofing_research.py")
            ], check=True)
            if self.stop_generation: return
            
            # Step 5: Generate Combined Data (100%)
            self.update_status("Generating Website Data...", 80)
            subprocess.run([
                sys.executable,
                os.path.join(script_dir, "generate_combined_data.py")
            ], check=True)
            
            # Complete
            self.update_status("Generation Complete!", 100)
            messagebox.showinfo("Success", "Website data generation complete!")
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Error in subprocess: {e}")
            messagebox.showerror("Error", f"An error occurred during generation: {e}")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            messagebox.showerror("Error", f"An unexpected error occurred: {e}")
        finally:
            # Re-enable input
            self.bbb_url['state'] = 'normal'
            self.google_url['state'] = 'normal'
            self.start_button['state'] = 'normal'
            self.cancel_button['state'] = 'disabled'

class QueueHandler:
    """Handler for passing log records through a queue"""
    def __init__(self, queue):
        self.queue = queue
    
    def emit(self, record):
        self.queue.put(f"{record.levelname}: {record.getMessage()}")

def main():
    try:
        app = WebsiteGeneratorGUI()
        app.root.mainloop()
    except Exception as e:
        logger.error(f"Application error: {e}")
        messagebox.showerror("Error", f"Application error: {e}")

if __name__ == "__main__":
    main() 