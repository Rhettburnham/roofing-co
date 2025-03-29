#!/usr/bin/env python3

import csv
import json
import os
import pandas as pd
from typing import List, Dict, Any, Optional

def load_leads_csv(filepath: str) -> pd.DataFrame:
    """
    Load leads data from a CSV file
    
    Args:
        filepath: Path to the CSV file containing leads data
        
    Returns:
        DataFrame containing the leads data
    """
    try:
        df = pd.read_csv(filepath)
        print(f"Successfully loaded {len(df)} leads from {filepath}")
        return df
    except Exception as e:
        print(f"Error loading leads file: {e}")
        return pd.DataFrame()

def load_bbb_profiles(filepath: str) -> List[Dict[str, Any]]:
    """
    Load BBB profile data from a JSON file
    
    Args:
        filepath: Path to the JSON file containing BBB profiles
        
    Returns:
        List of dictionaries containing BBB profile data
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Handle both single profiles and lists of profiles
        if isinstance(data, dict):
            profiles = [data]
        else:
            profiles = data
            
        print(f"Successfully loaded {len(profiles)} BBB profiles from {filepath}")
        return profiles
    except Exception as e:
        print(f"Error loading BBB profiles: {e}")
        return []

def filter_businesses(
    leads_df: pd.DataFrame,
    bbb_profiles: List[Dict[str, Any]],
    output_dir: str = "filtered_data"
) -> pd.DataFrame:
    """
    Filter businesses based on BBB profile presence and website availability
    
    Args:
        leads_df: DataFrame containing leads data
        bbb_profiles: List of BBB profile data dictionaries
        output_dir: Directory to save output files
        
    Returns:
        DataFrame containing filtered businesses
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Create a set of business names from BBB profiles for faster lookup
    bbb_business_names = {profile.get('business_name', '').lower() for profile in bbb_profiles}
    
    # 2. Filter businesses with BBB profiles
    business_name_col = next((col for col in leads_df.columns if 'name' in col.lower()), None)
    website_col = next((col for col in leads_df.columns if 'website' in col.lower() or 'url' in col.lower()), None)
    
    if not business_name_col or not website_col:
        print(f"Error: Missing required columns in leads data. Available columns: {leads_df.columns.tolist()}")
        return pd.DataFrame()
    
    # Filter businesses with BBB profiles
    leads_df['has_bbb_profile'] = leads_df[business_name_col].str.lower().apply(
        lambda name: any(name in bbb_name or bbb_name in name for bbb_name in bbb_business_names)
    )
    
    # Filter businesses without websites
    leads_df['has_website'] = ~(
        leads_df[website_col].isna() | 
        leads_df[website_col].str.strip().eq('') | 
        leads_df[website_col].str.lower().eq('n/a')
    )
    
    # Apply filters: has BBB profile but no website
    filtered_df = leads_df[leads_df['has_bbb_profile'] & ~leads_df['has_website']]
    
    # Save filtered results
    filtered_csv_path = os.path.join(output_dir, "filtered_businesses.csv")
    filtered_df.to_csv(filtered_csv_path, index=False)
    print(f"Saved {len(filtered_df)} filtered businesses to {filtered_csv_path}")
    
    # Create a summary file with statistics
    with open(os.path.join(output_dir, "filter_summary.txt"), 'w') as f:
        f.write(f"Total leads: {len(leads_df)}\n")
        f.write(f"Businesses with BBB profiles: {leads_df['has_bbb_profile'].sum()}\n")
        f.write(f"Businesses without websites: {(~leads_df['has_website']).sum()}\n")
        f.write(f"Filtered businesses (BBB profile, no website): {len(filtered_df)}\n")
    
    return filtered_df

def main():
    # Get the script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Navigate to parent directory (data folder)
    data_dir = os.path.dirname(script_dir)
    
    # Input and output directories
    raw_data_dir = os.path.join(data_dir, "raw_data")
    processed_data_dir = os.path.join(data_dir, "processed_data")
    output_dir = os.path.join(data_dir, "filtered")
    
    # Input files
    leads_file = os.path.join(raw_data_dir, "rawroofing_till30097.csv")
    bbb_profiles_file = os.path.join(processed_data_dir, "bbb_profile_data.json")
    
    print(f"Using leads file: {leads_file}")
    print(f"Using BBB profiles file: {bbb_profiles_file}")
    
    # Load data
    leads_df = load_leads_csv(leads_file)
    bbb_profiles = load_bbb_profiles(bbb_profiles_file)
    
    # Filter businesses
    if not leads_df.empty and bbb_profiles:
        filtered_df = filter_businesses(leads_df, bbb_profiles, output_dir)
        print(f"Filtering complete. Found {len(filtered_df)} businesses with BBB profiles but no websites.")
    else:
        print("Error: Unable to proceed with filtering due to missing data.")

if __name__ == "__main__":
    main() 