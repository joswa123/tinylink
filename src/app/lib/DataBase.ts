import { Pool } from 'pg';
import { generateRandomCode } from '../lib/utlis'; // ← CHANGED

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings for optimal performance
  max: 20, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // how long to wait for a connection
  maxUses: 7500, // close a client after it has been used a certain number of times
});

// Test connection on startup
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize connection
testConnection();

export interface Link {
  id: number;
  short_code: string;
  long_url: string;
  click_count: number;
  last_clicked: Date | null;
  created_at: Date;
}

export class DatabaseService {
  async createLink(longUrl: string, customCode?: string) {
    const shortCode = customCode || generateRandomCode(); // ← NOW WORKS
    
    const result = await pool.query(
      `INSERT INTO links (short_code, long_url) 
       VALUES ($1, $2) 
       RETURNING *`,
      [shortCode, longUrl]
    );
    
    return result.rows[0];
  } 
  // READ: Get link by short code
  async getLinkByCode(code: string): Promise<Link | null> {
    const result = await pool.query(
      `SELECT * FROM links WHERE short_code = $1`,
      [code]
    );
    return result.rows[0] || null;
  }

   async getAllLinks(): Promise<Link[]> {
    try {
      const result = await pool.query(
        `SELECT id, short_code, long_url, click_count, last_clicked, created_at 
         FROM links 
         ORDER BY created_at DESC`
      );
      return result.rows;
    } catch (error) {
      console.error('Database error in getAllLinks:', error);
      return [];
    }
  }
  // UPDATE: Increment click count
    async incrementClickCount(code: string): Promise<void> {
    await pool.query(
      `UPDATE links 
       SET click_count = click_count + 1, last_clicked = NOW() 
       WHERE short_code = $1`,
      [code]
    );
  }
async deleteLink(code: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM links WHERE short_code = $1',
        [code]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Database error in deleteLink:', error);
      return false;
    }
  }


  // CHECK: Verify if code exists
  async codeExists(code: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM links WHERE short_code = $1',
      [code]
    );
    return result.rows.length > 0;
  }

  // HEALTH: Check database connection
  async healthCheck(): Promise<boolean> {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  // UTILITY: Generate random code
  private generateRandomCode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // UTILITY: Sanitize URL
  private sanitizeUrl(url: string): string {
    return url.trim();
  }
}

// Create singleton instance
export const db = new DatabaseService();