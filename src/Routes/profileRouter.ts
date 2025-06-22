import express, { Response } from 'express';
import bcrypt from 'bcrypt';
import { userAuth } from '../middlewares/auth';
import UserModel from '../models/userSQL';
import { validateEditProfileData } from '../utils/validations';
import { AuthenticatedRequest, EditProfileData, PasswordUpdateData } from '../types';

const profileRouter = express.Router();

// Profile API for logged in user
profileRouter.get("/view", userAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send("ERROR :" + (error as Error).message);
  }
});

// Update user data
profileRouter.patch("/edit", userAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edit request");
    }
    const user = req.user!;

    // Prepare update data
    const updateData: EditProfileData = {};
    const allowedFields: (keyof EditProfileData)[] = ['firstName', 'lastName', 'gender', 'age', 'about', 'photo', 'skills'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    const updatedUser = await UserModel.update(user.id, updateData);
    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    res.status(200).send({
      message: `${updatedUser.firstName} updated the profile`,
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).send("ERROR :" + (error as Error).message);
  }
});

// Update user password
profileRouter.patch("/password", userAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword }: PasswordUpdateData = req.body;
    const user = req.user!;
    const isPasswordMatch = await UserModel.validatePassword(user.id, oldPassword);
    if (!isPasswordMatch) {
      res.status(401).send("Invalid credentials");
      return;
    } else {
      //Encrypt the password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const updatedUser = await UserModel.update(user.id, { password: passwordHash });
      if (!updatedUser) {
        throw new Error("Failed to update password");
      }
      res.clearCookie("token", { expires: new Date(Date.now()) });
      res.status(200).send("Password updated successfully");
    }
  } catch (error) {
    res.status(400).send("ERROR :" + (error as Error).message);
  }
});

// Delete user by ID
profileRouter.delete("/deleteUser", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const success = await UserModel.delete(req.body.userId);
    if (!success) {
      res.status(404).send("User not found");
      return;
    } else {
      res.status(200).send("User deleted");
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

export default profileRouter; 