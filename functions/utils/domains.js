/**
 * Add a new domain entry to the database
 * @param {D1Database} db - The D1 database instance
 * @param {Object} params - The domain parameters
 * @param {string} params.email - The user's email
 * @param {string} params.configId - The configuration ID
 * @param {string} params.domain - The domain name
 * @param {boolean} [params.isPaid=true] - Whether the domain is paid
 * @param {boolean} [params.isActive=true] - Whether the domain is active
 * @returns {Promise<Object>} The created domain entry
 */
export async function addDomain(db, { email, configId, domain, isPaid = true, isActive = true }) {
    try {
        const result = await db.prepare(
            `INSERT INTO domains (email, config_id, domain, is_paid, is_active)
             VALUES (?, ?, ?, ?, ?)
             RETURNING *`
        ).bind(
            email, 
            configId, 
            domain,
            isPaid ? 1 : 0,
            isActive ? 1 : 0
        ).first();

        if (!result) {
            throw new Error('Failed to create domain entry');
        }

        // Convert numeric booleans to actual booleans
        return {
            ...result,
            is_paid: Boolean(result.is_paid),
            is_active: Boolean(result.is_active)
        };
    } catch (error) {
        console.error('Error adding domain:', error);
        throw error;
    }
}

/**
 * Get a domain entry by domain name
 * @param {D1Database} db - The D1 database instance
 * @param {string} domain - The domain name to look up
 * @returns {Promise<Object|null>} The domain entry or null if not found
 */
export async function getDomainByDomain(db, domain) {
    try {
        const result = await db.prepare(
            'SELECT * FROM domains WHERE domain = ?'
        ).bind(domain).first();

        if (result) {
            // Convert numeric booleans to actual booleans
            return {
                ...result,
                is_paid: Boolean(result.is_paid),
                is_active: Boolean(result.is_active)
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting domain:', error);
        throw error;
    }
}

/**
 * Get domains by email
 * @param {D1Database} db - The D1 database instance
 * @param {string} email - The email to look up
 * @returns {Promise<Array>} Array of domain entries
 */
export async function getDomainsByEmail(db, email) {
    try {
        const results = await db.prepare(
            'SELECT * FROM domains WHERE email = ?'
        ).bind(email).all();

        // Convert numeric booleans to actual booleans
        return results.map(domain => ({
            ...domain,
            is_paid: Boolean(domain.is_paid),
            is_active: Boolean(domain.is_active)
        }));
    } catch (error) {
        console.error('Error getting domains by email:', error);
        throw error;
    }
}

/**
 * Get domains by config ID
 * @param {D1Database} db - The D1 database instance
 * @param {string} configId - The config ID to look up
 * @returns {Promise<Array>} Array of domain entries
 */
export async function getDomainsByConfigId(db, configId) {
    try {
        const results = await db.prepare(
            'SELECT * FROM domains WHERE config_id = ?'
        ).bind(configId).all();

        // Convert numeric booleans to actual booleans
        return results.map(domain => ({
            ...domain,
            is_paid: Boolean(domain.is_paid),
            is_active: Boolean(domain.is_active)
        }));
    } catch (error) {
        console.error('Error getting domains by config ID:', error);
        throw error;
    }
} 