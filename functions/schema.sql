-- Drop existing domains table if it exists
DROP TABLE IF EXISTS domains;

-- Create domains table with email as foreign key
CREATE TABLE domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    config_id TEXT NOT NULL,
    domain VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_paid BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES users(email),
    UNIQUE(domain)
); 