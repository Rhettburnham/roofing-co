import json
import os

def load_json(file_path):
    """Load JSON data from a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"Error: {file_path} does not exist.")
        return {}
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from {file_path}: {e}")
        return {}

def combine_json_files(input_directory, output_file):
    """Combine multiple JSON files into a single JSON file."""
    combined_data = {}

    # Define the mapping of JSON filenames to their keys in the combined JSON
    json_files = {
        'bbb_profile_data.json': 'bbbProfileData',
        'colors_output.json': 'colorsOutput',
        'richText.json': 'richText',
        'sentiment_reviews.json': 'sentimentReviews'
    }

    for filename, key in json_files.items():
        file_path = os.path.join(input_directory, filename)
        data = load_json(file_path)
        combined_data[key] = data

    # Write the combined data to the output file
    try:
        with open(output_file, 'w', encoding='utf-8') as outfile:
            json.dump(combined_data, outfile, indent=4)
        print(f"Successfully combined JSON files into {output_file}")
    except IOError as e:
        print(f"Error writing to {output_file}: {e}")

if __name__ == "__main__":
    input_dir = ''  # Directory where your JSON files are located
    output_json = 'combined_data.json'  # Name of the combined JSON file
    combine_json_files(input_dir, output_json)
