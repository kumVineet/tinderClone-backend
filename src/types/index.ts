import { Request } from 'express';

export interface IUser {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  age?: number;
  gender?: 'male' | 'female' | 'others';
  about?: string;
  photo?: string;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

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

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  cookies: {
    token?: string;
    [key: string]: any;
  };
  body: any;
  params: any;
  query: any;
}

export interface SignupData {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  age?: number;
  gender?: 'male' | 'female' | 'others';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface EditProfileData {
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'others';
  age?: number;
  about?: string;
  photo?: string;
  skills?: string[];
}

export interface PasswordUpdateData {
  oldPassword: string;
  newPassword: string;
}

export interface JwtPayload {
  _id: number;
  iat?: number;
  exp?: number;
} 