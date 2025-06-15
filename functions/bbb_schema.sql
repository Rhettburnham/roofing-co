-- Drop existing table if it exists
DROP TABLE IF EXISTS bbb_data;

-- Create bbb_data table
CREATE TABLE bbb_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_name TEXT NOT NULL,
    contact_status TEXT DEFAULT '',
    email TEXT DEFAULT '',
    worker TEXT DEFAULT '',
    config_id TEXT DEFAULT '',
    rating TEXT,
    number_of_reviews TEXT,
    category TEXT,
    address TEXT,
    state TEXT,
    phone TEXT,
    operational_hours TEXT,
    website TEXT,
    google_reviews_link TEXT,
    industry TEXT,
    location TEXT,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_name)
); 