import { Request } from "express";

export interface IUser {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  age?: number;
  gender?: "male" | "female" | "others";
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

export interface IConnectionRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  fromUserName?: string;
  toUserName?: string;
  status: "ignore" | "accepted" | "rejected" | "interested";
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
  month?: number;
  date?: number;
  year?: number;
  gender?: "male" | "female" | "others";
  interest?: "male" | "female" | "everyone";
  lookingFor?: string[];
  hobbies?: string[];
  about?: string;
  imageUrls?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface EditProfileData {
  firstName?: string;
  lastName?: string;
  gender?: "male" | "female" | "others";
  age?: number;
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

export interface PasswordUpdateData {
  oldPassword: string;
  newPassword: string;
}

export interface JwtPayload {
  _id: number;
  iat?: number;
  exp?: number;
}
