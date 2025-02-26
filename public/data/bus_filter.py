import pandas as pd
import os
import sys

def main():
    # Define the filename
    input_filename = 'google_maps_business_listings_multi_search.csv'
    
    # Get the directory where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Full path to the input CSV
    input_path = os.path.join(script_dir, input_filename)
    
    # Check if the input file exists
    if not os.path.isfile(input_path):
        print(f"Error: The file '{input_filename}' was not found in the directory '{script_dir}'.")
        sys.exit(1)
    
    # Define column names based on the JSON structure
    column_names = [
        "BusinessName",
        "Rating",
        "NumberOfReviews",
        "Category",
        "Address",
        "Phone",
        "Close",
        "Website",
        "GoogleReviewsLink",
        "Industry",
        "Location"
    ]
    
    try:
        # Read the CSV file without headers
        df = pd.read_csv(input_path, header=None, names=column_names, dtype=str)
        
        # Remove entries where BusinessName is "N/A"
        # Filter rows where 'BusinessName' is not 'N/A'
        df_clean = df[df['BusinessName'].str.strip().str.upper() != "N/A"].copy()

        # Remove duplicate business names
        df_clean = df_clean.drop_duplicates(subset='BusinessName', keep='first')

        # Save cleaned data to all_businesses.csv
        df_clean.to_csv('all_businesses.csv', index=False)

        # Filter businesses without a website (handle NaN values properly)
        df_without_web = df_clean[df_clean['Website'].isna() | (df_clean['Website'].str.strip().str.upper() == "N/A")]

        # Save businesses without a website to without_web.csv
        df_without_web.to_csv('without_web.csv', index=False)

        print("Processing complete. Files saved.")

        
    except Exception as e:
        print(f"An error occurred while processing the CSV file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
