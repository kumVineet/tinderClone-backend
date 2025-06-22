import mysql from 'mysql2/promise';
import pool from '../config/mysql';
import UserModel from './userSQL';

export interface IConnectionRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  fromUserName?: string;
  toUserName?: string;
  status: 'ignore' | 'accepted' | 'rejected' | 'interested';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConnectionRequestData {
  fromUserId: number;
  toUserId: number;
  status: 'ignore' | 'interested';
}

class ConnectionRequestModel {
  // Create a new connection request
  static async create(data: CreateConnectionRequestData): Promise<IConnectionRequest> {
    const connection = await pool.getConnection();
    
    try {
      // Validate that users exist and get their names
      const [fromUser, toUser] = await Promise.all([
        UserModel.findById(data.fromUserId),
        UserModel.findById(data.toUserId)
      ]);

      if (!fromUser || !toUser) {
        throw new Error("User not found");
      }

      // Check if request already exists
      const existingRequest = await this.findOne({
        fromUserId: data.fromUserId,
        toUserId: data.toUserId
      });

      if (existingRequest) {
        throw new Error("Connection request already exists");
      }

      // Check if reverse request exists
      const reverseRequest = await this.findOne({
        fromUserId: data.toUserId,
        toUserId: data.fromUserId
      });

      if (reverseRequest) {
        throw new Error("Connection request already exists");
      }

      const [result] = await connection.execute(
        `INSERT INTO connection_requests (fromUserId, toUserId, fromUserName, toUserName, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [data.fromUserId, data.toUserId, fromUser.firstName, toUser.firstName, data.status]
      );

      const requestId = (result as any).insertId;
      const request = await this.findById(requestId);
      if (!request) {
        throw new Error("Failed to create connection request");
      }
      return request;
    } finally {
      connection.release();
    }
  }

  // Find connection request by ID
  static async findById(id: number): Promise<IConnectionRequest | null> {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM connection_requests WHERE id = ?',
        [id]
      );

      const requests = rows as IConnectionRequest[];
      return requests.length > 0 ? requests[0] : null;
    } finally {
      connection.release();
    }
  }

  // Find connection request by criteria
  static async findOne(criteria: Partial<IConnectionRequest>): Promise<IConnectionRequest | null> {
    const connection = await pool.getConnection();
    
    try {
      const conditions = Object.keys(criteria).map(key => `${key} = ?`).join(' AND ');
      const values = Object.values(criteria);

      const [rows] = await connection.execute(
        `SELECT * FROM connection_requests WHERE ${conditions}`,
        values
      );

      const requests = rows as IConnectionRequest[];
      return requests.length > 0 ? requests[0] : null;
    } finally {
      connection.release();
    }
  }

  // Find multiple connection requests
  static async find(criteria: Partial<IConnectionRequest>): Promise<IConnectionRequest[]> {
    const connection = await pool.getConnection();
    
    try {
      const conditions = Object.keys(criteria).map(key => `${key} = ?`).join(' AND ');
      const values = Object.values(criteria);

      const [rows] = await connection.execute(
        `SELECT * FROM connection_requests WHERE ${conditions}`,
        values
      );

      return rows as IConnectionRequest[];
    } finally {
      connection.release();
    }
  }

  // Find requests with OR conditions (for complex queries)
  static async findWithOr(conditions: Array<Partial<IConnectionRequest>>): Promise<IConnectionRequest[]> {
    const connection = await pool.getConnection();
    
    try {
      const orConditions = conditions.map(condition => {
        const keys = Object.keys(condition);
        const values = Object.values(condition);
        return `(${keys.map(key => `${key} = ?`).join(' AND ')})`;
      }).join(' OR ');

      const values = conditions.flatMap(condition => Object.values(condition));

      const [rows] = await connection.execute(
        `SELECT * FROM connection_requests WHERE ${orConditions}`,
        values
      );

      return rows as IConnectionRequest[];
    } finally {
      connection.release();
    }
  }

  // Update connection request
  static async update(id: number, updateData: Partial<IConnectionRequest>): Promise<IConnectionRequest | null> {
    const connection = await pool.getConnection();
    
    try {
      const fields = Object.keys(updateData).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
      const values = fields.map(field => updateData[field as keyof IConnectionRequest]);

      if (fields.length === 0) return await this.findById(id);

      const query = `UPDATE connection_requests SET ${fields.map(field => `${field} = ?`).join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      values.push(id);

      await connection.execute(query, values);
      return await this.findById(id);
    } finally {
      connection.release();
    }
  }

  // Delete connection request
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        'DELETE FROM connection_requests WHERE id = ?',
        [id]
      );

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Get connection requests for a user (incoming or outgoing)
  static async getRequestsForUser(userId: number, status?: string): Promise<IConnectionRequest[]> {
    const connection = await pool.getConnection();
    
    try {
      let query = 'SELECT * FROM connection_requests WHERE fromUserId = ? OR toUserId = ?';
      const params: any[] = [userId, userId];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY createdAt DESC';

      const [rows] = await connection.execute(query, params);
      return rows as IConnectionRequest[];
    } finally {
      connection.release();
    }
  }

  // Get accepted connections for a user
  static async getAcceptedConnections(userId: number): Promise<IConnectionRequest[]> {
    return this.findWithOr([
      { fromUserId: userId, status: 'accepted' },
      { toUserId: userId, status: 'accepted' }
    ]);
  }
}

export default ConnectionRequestModel; 