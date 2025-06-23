import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/environment';
import pool from '../config/mysql';

export interface IUser {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  age?: number;
  gender?: 'male' | 'female' | 'others';
  about?: string;
  // Photo keys (stored in database)
  photo1_key?: string;
  photo2_key?: string;
  photo3_key?: string;
  photo4_key?: string;
  // Photo URLs (generated on-demand for frontend)
  photo1?: string;
  photo2?: string;
  photo3?: string;
  photo4?: string;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  age?: number;
  gender?: 'male' | 'female' | 'others';
  about?: string;
  // Photo keys (stored in database)
  photo1_key?: string;
  photo2_key?: string;
  photo3_key?: string;
  photo4_key?: string;
  // Photo URLs (generated on-demand for frontend)
  photo1?: string;
  photo2?: string;
  photo3?: string;
  photo4?: string;
  skills?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface EditProfileData {
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: 'male' | 'female' | 'others';
  about?: string;
  // Photo keys (for database storage)
  photo1_key?: string;
  photo2_key?: string;
  photo3_key?: string;
  photo4_key?: string;
  // Photo URLs (for frontend display)
  photo1?: string;
  photo2?: string;
  photo3?: string;
  photo4?: string;
  skills?: string[];
}

class UserModel {
  // Create a new user
  static async create(userData: CreateUserData): Promise<IUser> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const connection = await pool.getConnection();
      
      try {
        // Hash the password
        const passwordHash = await bcrypt.hash(userData.password, 10);
        
        const [result] = await connection.execute(
          `INSERT INTO users (firstName, lastName, email, password, age, gender, about, photo1_key, photo2_key, photo3_key, photo4_key, skills) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userData.firstName,
            userData.lastName || null,
            userData.email,
            passwordHash,
            userData.age || null,
            userData.gender || null,
            userData.about || config.defaultUserAbout,
            userData.photo1_key || null,
            userData.photo2_key || null,
            userData.photo3_key || null,
            userData.photo4_key || null,
            userData.skills ? JSON.stringify(userData.skills) : null,
          ]
        );

        const userId = (result as any).insertId;
        const user = await this.findById(userId);
        if (!user) {
          throw new Error('Failed to create user');
        }
        return user;
      } catch (error) {
        lastError = error as Error;
        
        // If it's an ECONNRESET error and we have retries left, wait and retry
        if (error instanceof Error && 
            (error.message.includes('ECONNRESET') || error.message.includes('Connection lost')) &&
            attempt < maxRetries) {
          console.log(`Database connection error on attempt ${attempt}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Exponential backoff
          continue;
        }
        
        // If it's not a connection error or we're out of retries, throw the error
        throw error;
      } finally {
        connection.release();
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error('Failed to create user after multiple attempts');
  }

  // Find user by ID
  static async findById(id: number): Promise<IUser | null> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const connection = await pool.getConnection();
      
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM users WHERE id = ?',
          [id]
        );

        const users = rows as IUser[];
        if (users.length === 0) return null;

        const user = users[0];
        return {
          ...user,
          skills: user.skills ? JSON.parse(user.skills as any) : [],
        };
      } catch (error) {
        lastError = error as Error;
        
        // If it's an ECONNRESET error and we have retries left, wait and retry
        if (error instanceof Error && 
            (error.message.includes('ECONNRESET') || error.message.includes('Connection lost') || error.message.includes('Connection timeout')) &&
            attempt < maxRetries) {
          console.log(`Database connection error on findById attempt ${attempt}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Exponential backoff
          continue;
        }
        
        // If it's not a connection error or we're out of retries, throw the error
        throw error;
      } finally {
        connection.release();
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error('Failed to find user after multiple attempts');
  }

  // Find user by email
  static async findByEmail(email: string): Promise<IUser | null> {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      const users = rows as IUser[];
      if (users.length === 0) return null;

      const user = users[0];
      return {
        ...user,
        skills: user.skills ? JSON.parse(user.skills as any) : [],
      };
    } finally {
      connection.release();
    }
  }

  // Find users by gender (for feed)
  static async findByGender(gender: string, excludeIds: number[] = [], limit: number = 50, skip: number = 0): Promise<IUser[]> {
    const connection = await pool.getConnection();
    
    try {
      let query = 'SELECT * FROM users WHERE gender = ?';
      const params: any[] = [gender];

      if (excludeIds.length === 1) {
        // For single excluded ID, use != instead of NOT IN
        query += ' AND id != ?';
        params.push(Number(excludeIds[0]));
      } else if (excludeIds.length > 1) {
        // For multiple excluded IDs, use NOT IN
        const placeholders = excludeIds.map(() => '?').join(',');
        query += ` AND id NOT IN (${placeholders})`;
        params.push(...excludeIds.map(id => Number(id)));
      }

      query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(skip));

      const [rows] = await connection.query(query, params);
      const users = rows as IUser[];

      return users.map(user => ({
        ...user,
        skills: user.skills ? JSON.parse(user.skills as any) : [],
      }));
    } finally {
      connection.release();
    }
  }

  // Update user
  static async update(id: number, updateData: Partial<IUser>): Promise<IUser | null> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const connection = await pool.getConnection();
      
      try {
        // Filter out photo URL fields (they should not be stored in database)
        const { photo1, photo2, photo3, photo4, ...dbUpdateData } = updateData;
        
        const fields = Object.keys(dbUpdateData).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
        const values = fields.map(field => (dbUpdateData as any)[field]);

        if (fields.length === 0) return await this.findById(id);

        // Handle skills array serialization
        const processedValues = values.map((value, index) => {
          const fieldName = fields[index];
          if (fieldName === 'skills' && Array.isArray(value)) {
            return JSON.stringify(value);
          }
          return value;
        });

        const query = `UPDATE users SET ${fields.map(field => `${field} = ?`).join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        processedValues.push(id);

        await connection.execute(query, processedValues);
        return await this.findById(id);
      } catch (error) {
        lastError = error as Error;
        
        // If it's an ECONNRESET error and we have retries left, wait and retry
        if (error instanceof Error && 
            (error.message.includes('ECONNRESET') || error.message.includes('Connection lost') || error.message.includes('Connection timeout')) &&
            attempt < maxRetries) {
          console.log(`Database connection error on update attempt ${attempt}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Exponential backoff
          continue;
        }
        
        // If it's not a connection error or we're out of retries, throw the error
        throw error;
      } finally {
        connection.release();
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error('Failed to update user after multiple attempts');
  }

  // Delete user
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Validate password
  static async validatePassword(userId: number, passwordInput: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) return false;

    return await bcrypt.compare(passwordInput, user.password);
  }

  // Generate JWT token
  static async generateJWT(userId: number): Promise<string> {
    return jwt.sign({ _id: userId }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as any);
  }

  // Verify JWT token
  static async verifyJWT(token: string): Promise<{ _id: number } | null> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { _id: number };
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

export default UserModel; 