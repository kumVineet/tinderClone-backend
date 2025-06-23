import express, { Response } from 'express';
import bcrypt from 'bcrypt';
import { userAuth } from '../middlewares/auth';
import UserModel from '../models/userSQL';
import { validateEditProfileData } from '../utils/validations';
import { AuthenticatedRequest, EditProfileData, PasswordUpdateData } from '../types';
import uploadToS3, { validateBase64Image, generateUserPhotoUrls } from '../utils/uploadToS3';

const profileRouter = express.Router();

// Profile API for logged in user
profileRouter.get("/view", userAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userWithUrls = await generateUserPhotoUrls(req.user);
    res.status(200).send(userWithUrls);
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
    const allowedFields: (keyof EditProfileData)[] = [
      'firstName', 'lastName', 'gender', 'age', 'about', 
      'photo1_key', 'photo2_key', 'photo3_key', 'photo4_key',
      'photo1', 'photo2', 'photo3', 'photo4',
      'skills'
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle image uploads if provided
    const imageFields = ['photo1', 'photo2', 'photo3', 'photo4'] as const;
    const uploadedObjectKeys: string[] = [];

    for (const field of imageFields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        const base64Image = req.body[field] as string;
        
        // Validate the image first
        const validation = validateBase64Image(base64Image);
        if (!validation.isValid) {
          res.status(400).send(`ERROR: Invalid image for ${field}: ${validation.error}`);
          return;
        }

        // Upload to S3
        const uploadResult = await uploadToS3(base64Image);
        if (!uploadResult.success || !uploadResult.objectKey) {
          res.status(400).send(`ERROR: Failed to upload ${field}: ${uploadResult.error || 'No object key returned'}`);
          return;
        }

        // Store the object key in the corresponding _key field
        const keyField = `${field}_key` as keyof EditProfileData;
        (updateData as any)[keyField] = uploadResult.objectKey;
        uploadedObjectKeys.push(uploadResult.objectKey);
      }
    }
    
    // Check if there's actually data to update
    if (Object.keys(updateData).length === 0) {
      res.status(400).send("ERROR: No valid fields to update");
      return;
    }
    
    const updatedUser = await UserModel.update(user.id, updateData);
    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    // Generate signed URLs for the response
    const userWithUrls = await generateUserPhotoUrls(updatedUser);

    res.status(200).send({
      message: `${updatedUser.firstName} updated the profile`,
      data: userWithUrls,
      uploadedObjectKeys: uploadedObjectKeys.length > 0 ? uploadedObjectKeys : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Handle specific connection errors
    if (errorMessage.includes('ECONNRESET') || errorMessage.includes('Connection lost') || errorMessage.includes('Connection timeout')) {
      console.error('Database connection error during profile update:', errorMessage);
      res.status(503).send("ERROR: Database connection issue. Please try again in a moment.");
      return;
    }
    
    // Handle validation errors
    if (errorMessage.includes('Invalid edit request')) {
      res.status(400).send("ERROR: Invalid data provided for profile update");
      return;
    }
    
    // Handle other errors
    console.error('Profile update error:', errorMessage);
    res.status(500).send("ERROR: Failed to update profile. Please try again.");
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