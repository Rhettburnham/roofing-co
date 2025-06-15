#!/usr/bin/env python3
import csv
import os
import sys
import subprocess
from pathlib import Path

def execute_sql(sql, params=None):
    """Execute SQL using Wrangler CLI"""
    try:
        project_root = Path(__file__).parent.parent.absolute()
        
        # Create sql directory if it doesn't exist
        sql_dir = project_root / 'sql'
        sql_dir.mkdir(exist_ok=True)
        
        # Write SQL to file with timestamp
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        sql_path = sql_dir / f'bbb_migration_{timestamp}.sql'
        
        with open(sql_path, 'w') as f:
            f.write(sql.strip() + '\n')
        
        print(f"\nSQL saved to: {sql_path}")
        print(f"SQL content: {sql.strip()}")
        
        return True
    except Exception as e:
        print(f"Error saving SQL: {e}")
        return False

def verify_data():
    """Verify that data was inserted correctly"""
    try:
        # First check the count
        count_sql = "SELECT COUNT(*) as count FROM bbb_data;"
        # Then check actual data
        data_sql = "SELECT * FROM bbb_data LIMIT 5;"
        
        project_root = Path(__file__).parent.parent.absolute()
        
        # Write count SQL to temporary file
        temp_count_path = project_root / 'temp_count.sql'
        with open(temp_count_path, 'w') as f:
            f.write(count_sql.strip() + '\n')

        cmd = [
            'wrangler',
            'd1',
            'execute',
            'DB',
            '--file', str(temp_count_path),
            '--config', str(project_root / 'wrangler.toml'),
            '--env', 'production',
            '--remote'
        ]

        print(f"\nVerifying count with command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)

        # Clean up the temp file
        temp_count_path.unlink(missing_ok=True)

        print(f"Count verification output: {result.stdout}")
        if result.stderr:
            print(f"Count verification error: {result.stderr}")

        # Now check actual data
        temp_data_path = project_root / 'temp_data.sql'
        with open(temp_data_path, 'w') as f:
            f.write(data_sql.strip() + '\n')

        cmd = [
            'wrangler',
            'd1',
            'execute',
            'DB',
            '--file', str(temp_data_path),
            '--config', str(project_root / 'wrangler.toml'),
            '--env', 'production',
            '--remote'
        ]

        print(f"\nVerifying data with command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)

        # Clean up the temp file
        temp_data_path.unlink(missing_ok=True)

        print(f"Data verification output: {result.stdout}")
        if result.stderr:
            print(f"Data verification error: {result.stderr}")

        return True
    except Exception as e:
        print(f"Error verifying data: {e}")
        return False

def init_db():
    """Initialize the database with the BBB schema"""
    try:
        # Get the directory of this script
        script_dir = Path(__file__).parent
        
        # Read the schema file
        schema_path = script_dir / 'bbb_schema.sql'
        with open(schema_path, 'r') as f:
            schema_sql = f.read().strip()  # Remove any leading/trailing whitespace
        
        # Execute schema using Wrangler
        if not execute_sql(schema_sql):
            print("Failed to initialize database")
            sys.exit(1)
            
        print("Database initialized successfully")
        return True
    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)

def migrate_bbb_data():
    """Migrate BBB data from CSV to database"""
    try:
        # Get the path to the CSV file
        script_dir = Path(__file__).parent
        csv_path = script_dir.parent / 'public' / 'data' / 'rawroofing_till30097.csv'
        
        if not csv_path.exists():
            print(f"CSV data file not found at: {csv_path}")
            return
        
        # Read the CSV data
        with open(csv_path, 'r', encoding='utf-8') as f:
            # Read first line to verify headers
            header_line = f.readline().strip()
            print(f"CSV Headers: {header_line}")
            
            # Reset file pointer to start
            f.seek(0)
            
            csv_reader = csv.DictReader(f)
            
            # Prepare batch insert
            batch_size = 100  # Changed back to 100 for full processing
            current_batch = []
            total_rows = 0
            batch_counter = 1  # Add a batch counter
            from datetime import datetime
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            for row in csv_reader:
                # Debug print first row
                if total_rows == 0:
                    print(f"First row data: {dict(row)}")
                
                # Skip empty rows
                if not row.get('BusinessName') and not row.get('Address'):
                    continue
                
                # Prepare the data for insertion
                data = {
                    'business_name': row.get('BusinessName', '').replace("'", "''"),  # Escape single quotes
                    'contact_status': '',
                    'email': '',
                    'worker': '',
                    'config_id': '',
                    'rating': row.get('Rating', '').replace("'", "''"),
                    'number_of_reviews': row.get('NumberOfReviews', '').replace("'", "''"),
                    'category': row.get('Category', '').replace("'", "''"),
                    'address': row.get('Address', '').replace("'", "''"),
                    'state': 'Georgia',
                    'phone': row.get('Phone', '').replace("'", "''"),
                    'operational_hours': row.get('Close', '').replace("'", "''"),
                    'website': row.get('Website', '').replace("'", "''"),
                    'google_reviews_link': row.get('GoogleReviewsLink', '').replace("'", "''"),
                    'industry': row.get('Industry', '').replace("'", "''"),
                    'location': row.get('Location', '').replace("'", "''"),
                    'createdat': '',
                    'updatedat': ''
                }
                
                # Print the data being inserted for debugging
                print(f"\nRow {total_rows + 1} data:")
                for key, value in data.items():
                    print(f"{key}: {value}")
                
                # Create values string for this row
                values = f"('{data['business_name']}', '{data['contact_status']}', '{data['email']}', " \
                        f"'{data['worker']}', '{data['config_id']}', '{data['rating']}', " \
                        f"'{data['number_of_reviews']}', '{data['category']}', '{data['address']}', " \
                        f"'{data['state']}', '{data['phone']}', '{data['operational_hours']}', " \
                        f"'{data['website']}', '{data['google_reviews_link']}', '{data['industry']}', " \
                        f"'{data['location']}', '{data['createdat']}', '{data['updatedat']}')"
                
                current_batch.append(values)
                total_rows += 1
                
                # When batch is full, insert it
                if len(current_batch) >= batch_size:
                    print("\nPreparing SQL for batch insert:")
                    sql = f'''
                        INSERT OR REPLACE INTO bbb_data (
                            business_name, contact_status, email, worker, config_id,
                            rating, number_of_reviews, category, address, state,
                            phone, operational_hours, website, google_reviews_link,
                            industry, location, createdat, updatedat
                        ) VALUES {','.join(current_batch)};
                    '''
                    # Save each batch with a unique filename using batch_counter
                    project_root = Path(__file__).parent.parent.absolute()
                    sql_dir = project_root / 'sql'
                    sql_dir.mkdir(exist_ok=True)
                    sql_path = sql_dir / f'bbb_migration_{timestamp}_batch{batch_counter}.sql'
                    with open(sql_path, 'w') as f_sql:
                        f_sql.write(sql.strip() + '\n')
                    print(f"\nSQL saved to: {sql_path}")
                    print(f"SQL content: {sql.strip()}")
                    current_batch = []
                    batch_counter += 1
                    print(f"Processed {total_rows} rows...")
            
            # Insert any remaining rows
            if current_batch:
                print("\nPreparing SQL for final batch:")
                sql = f'''
                    INSERT OR REPLACE INTO bbb_data (
                        business_name, contact_status, email, worker, config_id,
                        rating, number_of_reviews, category, address, state,
                        phone, operational_hours, website, google_reviews_link,
                        industry, location, createdat, updatedat
                    ) VALUES {','.join(current_batch)};
                '''
                project_root = Path(__file__).parent.parent.absolute()
                sql_dir = project_root / 'sql'
                sql_dir.mkdir(exist_ok=True)
                sql_path = sql_dir / f'bbb_migration_{timestamp}_batch{batch_counter}.sql'
                with open(sql_path, 'w') as f_sql:
                    f_sql.write(sql.strip() + '\n')
                print(f"\nSQL saved to: {sql_path}")
                print(f"SQL content: {sql.strip()}")
            
            print(f"Total rows processed: {total_rows}")
            
    except Exception as e:
        print(f"Error migrating BBB data: {e}")
        sys.exit(1)

def insert_batch(batch):
    """Insert a batch of rows into the database"""
    if not batch:
        return
        
    # Create the SQL command for batch insert
    sql = f'''
        INSERT OR REPLACE INTO bbb_data (
            business_name, contact_status, email, worker, config_id,
            rating, number_of_reviews, category, address, state,
            phone, operational_hours, website, google_reviews_link,
            industry, location, createdat, updatedat
        ) VALUES {','.join(batch)}
    '''
    
    # Insert the batch using Wrangler
    if not execute_sql(sql):
        print("Failed to insert batch")
        return False
    
    return True

def main():
    """Main function to run the migration"""
    print("Starting BBB data migration...")
    
    # Initialize database
    if init_db():
        # Migrate the data
        migrate_bbb_data()
        print("\nMigration SQL files have been saved. You can now run them manually using:")
        print("wrangler d1 execute DB --file sql/bbb_migration_*.sql --config wrangler.toml --env production --remote")
        print("\nMigration completed successfully")

if __name__ == "__main__":
    main() 