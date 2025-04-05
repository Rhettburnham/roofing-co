#!/usr/bin/env python3
import os
import json
import logging
from collections import defaultdict
import matplotlib.pyplot as plt
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def load_category_data():
    """Load the shingle category data"""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        metadata_file = os.path.join(script_dir, 'shingle_categories.json')
        
        if not os.path.exists(metadata_file):
            logging.error(f"Category metadata file not found: {metadata_file}")
            return None
        
        with open(metadata_file, 'r', encoding='utf-8') as f:
            category_data = json.load(f)
        
        logging.info(f"Loaded category data with {len(category_data)} categories")
        return category_data
    except Exception as e:
        logging.error(f"Error loading category data: {str(e)}")
        return None

def analyze_categories(category_data):
    """Analyze the category data and print statistics"""
    if not category_data:
        return
    
    # Count items per category
    category_counts = {category: len(items) for category, items in category_data.items()}
    total_items = sum(category_counts.values())
    
    # Count items by brand
    brand_counts = defaultdict(int)
    brand_category_counts = defaultdict(lambda: defaultdict(int))
    
    # Count categorization sources
    source_counts = defaultdict(int)
    
    for category, items in category_data.items():
        for item in items:
            brand = item.get('brand', 'Unknown')
            source = item.get('categorization_source', 'Unknown')
            
            brand_counts[brand] += 1
            brand_category_counts[brand][category] += 1
            source_counts[source] += 1
    
    # Print category statistics
    print("\n=== CATEGORY STATISTICS ===")
    print(f"Total items: {total_items}")
    print("\nItems per category:")
    for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / total_items) * 100
        print(f"  {category}: {count} items ({percentage:.1f}%)")
    
    # Print brand statistics
    print("\n=== BRAND STATISTICS ===")
    print(f"Total brands: {len(brand_counts)}")
    print("\nItems per brand:")
    for brand, count in sorted(brand_counts.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / total_items) * 100
        print(f"  {brand}: {count} items ({percentage:.1f}%)")
    
    # Print source statistics
    print("\n=== CATEGORIZATION SOURCE STATISTICS ===")
    for source, count in source_counts.items():
        percentage = (count / total_items) * 100
        print(f"  {source}: {count} items ({percentage:.1f}%)")
    
    return {
        'category_counts': category_counts,
        'brand_counts': brand_counts,
        'brand_category_counts': brand_category_counts,
        'source_counts': source_counts,
        'total_items': total_items
    }

def generate_visualizations(stats):
    """Generate visualization charts for the statistics"""
    try:
        # Create output directory for charts
        script_dir = os.path.dirname(os.path.abspath(__file__))
        charts_dir = os.path.join(script_dir, 'charts')
        os.makedirs(charts_dir, exist_ok=True)
        
        # Category distribution pie chart
        plt.figure(figsize=(10, 6))
        categories = list(stats['category_counts'].keys())
        counts = list(stats['category_counts'].values())
        
        plt.pie(counts, labels=categories, autopct='%1.1f%%', startangle=90)
        plt.axis('equal')
        plt.title('Distribution of Shingle Products by Category')
        plt.tight_layout()
        plt.savefig(os.path.join(charts_dir, 'category_distribution.png'))
        plt.close()
        
        # Brand distribution bar chart (top 10)
        plt.figure(figsize=(12, 6))
        top_brands = sorted(stats['brand_counts'].items(), key=lambda x: x[1], reverse=True)[:10]
        brand_names = [brand for brand, _ in top_brands]
        brand_counts = [count for _, count in top_brands]
        
        plt.bar(brand_names, brand_counts)
        plt.xticks(rotation=45, ha='right')
        plt.title('Top 10 Brands by Number of Products')
        plt.xlabel('Brand')
        plt.ylabel('Number of Products')
        plt.tight_layout()
        plt.savefig(os.path.join(charts_dir, 'top_brands.png'))
        plt.close()
        
        # Categorization source pie chart
        plt.figure(figsize=(8, 6))
        sources = list(stats['source_counts'].keys())
        source_counts = list(stats['source_counts'].values())
        
        plt.pie(source_counts, labels=sources, autopct='%1.1f%%', startangle=90)
        plt.axis('equal')
        plt.title('Categorization Method Distribution')
        plt.tight_layout()
        plt.savefig(os.path.join(charts_dir, 'categorization_source.png'))
        plt.close()
        
        # Top brands by category (stacked bar chart)
        top_5_brands = [brand for brand, _ in top_brands[:5]]
        categories = list(stats['category_counts'].keys())
        
        data = []
        for brand in top_5_brands:
            brand_data = []
            for category in categories:
                brand_data.append(stats['brand_category_counts'][brand][category])
            data.append(brand_data)
        
        plt.figure(figsize=(14, 8))
        bar_width = 0.6
        x = np.arange(len(categories))
        
        bottom = np.zeros(len(categories))
        for i, brand_data in enumerate(data):
            plt.bar(x, brand_data, bar_width, bottom=bottom, label=top_5_brands[i])
            bottom += brand_data
        
        plt.xlabel('Category')
        plt.ylabel('Number of Products')
        plt.title('Top 5 Brands Distribution by Category')
        plt.xticks(x, categories, rotation=45, ha='right')
        plt.legend()
        plt.tight_layout()
        plt.savefig(os.path.join(charts_dir, 'brands_by_category.png'))
        plt.close()
        
        logging.info(f"Generated visualization charts in {charts_dir}")
    except Exception as e:
        logging.error(f"Error generating visualizations: {str(e)}")

def main():
    """Main function"""
    try:
        # Load category data
        category_data = load_category_data()
        if not category_data:
            return
        
        # Analyze categories
        stats = analyze_categories(category_data)
        
        # Generate visualizations
        try:
            import matplotlib
            generate_visualizations(stats)
        except ImportError:
            logging.warning("Matplotlib not available. Skipping visualization generation.")
            logging.info("To generate visualizations, install matplotlib with: pip install matplotlib")
        
        # Generate a summary report
        script_dir = os.path.dirname(os.path.abspath(__file__))
        report_file = os.path.join(script_dir, 'shingle_category_report.txt')
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("=== SHINGLE CATEGORY ANALYSIS REPORT ===\n\n")
            
            f.write(f"Total items: {stats['total_items']}\n\n")
            
            f.write("CATEGORY DISTRIBUTION:\n")
            for category, count in sorted(stats['category_counts'].items(), key=lambda x: x[1], reverse=True):
                percentage = (count / stats['total_items']) * 100
                f.write(f"  {category}: {count} items ({percentage:.1f}%)\n")
            
            f.write("\nTOP BRANDS:\n")
            for brand, count in sorted(stats['brand_counts'].items(), key=lambda x: x[1], reverse=True)[:10]:
                percentage = (count / stats['total_items']) * 100
                f.write(f"  {brand}: {count} items ({percentage:.1f}%)\n")
            
            f.write("\nCATEGORIZATION SOURCES:\n")
            for source, count in stats['source_counts'].items():
                percentage = (count / stats['total_items']) * 100
                f.write(f"  {source}: {count} items ({percentage:.1f}%)\n")
        
        logging.info(f"Analysis report saved to {report_file}")
        
    except Exception as e:
        logging.error(f"Error in main function: {str(e)}")

if __name__ == "__main__":
    main() 