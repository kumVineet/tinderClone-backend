/**
 * @deprecated This MongoDB user model is deprecated. 
 * Use src/models/userSQL.ts instead for SQL-based user management.
 * This file will be removed in a future update.
 */

import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/environment';
import { IUser } from '../types';

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      // required: true,
    },
    gender: {
      type: String,
      // required: true,
      enum: {
        values: ["male", "female", "others"],
        message: "{VALUE} is not supported",
      },
      validate(value: string) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender data is invalid");
        }
      },
    },
    about: {
      type: String,
      default: config.defaultUserAbout,
    },
    photo: {
      type: String,
      default: config.defaultUserPhoto,
      validate(value: string) {
        if (!validator.isURL(value)) {
          throw new Error("ImageUrl is invalid: " + value);
        }
      },
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function (): Promise<string> {
  // Never use arrow function here
  const token = jwt.sign({ _id: this._id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as any);
  return token;
};

userSchema.methods.validatePassword = async function (passwordInput: string): Promise<boolean> {
  const user = this;
  const isPasswordMatch = await bcrypt.compare(passwordInput, user.password);

  return isPasswordMatch;
};

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel; 