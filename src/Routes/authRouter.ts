import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { validateSignupData } from '../utils/validations';
import UserModel from '../models/userSQL';
import config from '../config/environment';
import { SignupData, LoginData } from '../types';

const authRouter = express.Router();

authRouter.post("/signup", async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate the data
    validateSignupData(req);
    const { firstName, lastName, email, password }: SignupData = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(400).send("User with this email already exists");
      return;
    }

    // Create the user
    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password,
    });

    res.status(200).send({ user: user });
  } catch (error) {
    res.status(400).send("ERROR : " + (error as Error).message);
  }
});

// Login user
authRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginData = req.body;
    if (!validator.isEmail(email)) {
      throw new Error("Invalid credentials");
    }
    
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    
    const isPasswordMatch = await UserModel.validatePassword(user.id, password);
    if (!isPasswordMatch) {
      res.status(401).send("Invalid credentials");
      return;
    } else {
      // Create JWT token here
      const token = await UserModel.generateJWT(user.id);
      // Add cookie here
      res.cookie("token", token, {
        expires: new Date(Date.now() + config.cookieExpiresHours * 3600000),
        httpOnly: true, // only for local host or without https
      });
      res.status(200).send({ user: user });
    }
  } catch (error) {
    res.status(400).send("Something went wrong :" + (error as Error).message);
  }
});

// Logout user
authRouter.post("/logout", async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("token", { expires: new Date(Date.now()) });
  res.status(200).send("Logout successful");
});

export default authRouter; 