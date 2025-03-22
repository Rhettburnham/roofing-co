import pandas as pd

# Read the CSV file
data = pd.read_csv("without_web.csv")

# Clean the NumberOfReviews column:
# - Remove parentheses
# - Convert to numeric, setting errors='coerce' to handle non-numeric values
# - Fill NaN values with 0 (optional, based on your needs)
data['NumberOfReviews'] = (
    data['NumberOfReviews']
    .astype(str)  # Ensure data is treated as strings
    .str.replace(r"[()]", "", regex=True)  # Remove parentheses
    .str.extract('(\d+)')  # Extract numeric values
    .astype(float)  # Convert to float first to handle missing values
    .fillna(0)  # Replace NaN with 0 if desired
    .astype(int)  # Convert to int
)

# Export the cleaned data to an Excel file
data.to_excel("output_preview.xlsx", index=False)

print("Data cleaned and exported to output_preview.xlsx successfully.")
