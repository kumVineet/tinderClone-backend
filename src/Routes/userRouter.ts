import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth';
import ConnectionRequestModel from '../models/connectionRequestSQL';
import UserModel from '../models/userSQL';
import { AuthenticatedRequest } from '../types';
import { generateUserPhotoUrls } from '../utils/uploadToS3';

const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName age photo about";

userRouter.get("/feed", userAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const loggedInUser = req.user!;
    const page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // Match opposite gender or use default preference logic
    let genderFind = "";
    if (loggedInUser.gender === "male") genderFind = "female";
    else if (loggedInUser.gender === "female") genderFind = "male";
    else genderFind = "others";

    // Get all userIds involved in connection requests with the current user
    const connectionRequests = await ConnectionRequestModel.getRequestsForUser(loggedInUser.id);

    // Extract all userIds to hide (both sender and receiver IDs)
    const excludedUserIds = [loggedInUser.id];
    for (const connectionReq of connectionRequests) {
      excludedUserIds.push(connectionReq.fromUserId);
      excludedUserIds.push(connectionReq.toUserId);
    }

    // Query for visible users using SQL
    const users = await UserModel.findByGender(genderFind, excludedUserIds, limit, skip);

    res.status(200).json(users);
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).send("Something went wrong");
  }
});

userRouter.get("/request", userAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const loggedInUser = req.user!;

    // Get incoming requests (where loggedInUser is the recipient)
    const connectionRequests = await ConnectionRequestModel.find({
      toUserId: loggedInUser.id,
      status: "interested"
    });

    if (connectionRequests.length === 0) {
      res.status(404).json({ message: "No connection request" });
      return;
    }

    // Get sender details for each request
    const requestsWithUserDetails = await Promise.all(
      connectionRequests.map(async (request) => {
        const fromUser = await UserModel.findById(request.fromUserId);
        if (!fromUser) return { ...request, fromUser: null };
        
        const fromUserWithUrls = await generateUserPhotoUrls(fromUser);
        return {
          ...request,
          fromUser: {
            id: fromUser.id,
            firstName: fromUser.firstName,
            lastName: fromUser.lastName,
            photo: fromUserWithUrls.photo1
          }
        };
      })
    );

    res.status(201).json({ 
      message: "Incoming Request found!!", 
      data: requestsWithUserDetails 
    });
  } catch (error) {
    res.status(400).send("ERROR : " + (error as Error).message);
  }
});

userRouter.get("/connections", userAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const loggedInUser = req.user!;

    // Get accepted connections
    const acceptedConnections = await ConnectionRequestModel.getAcceptedConnections(loggedInUser.id);

    if (acceptedConnections.length === 0) {
      res.status(404).json({ message: "No connections" });
      return;
    }

    // Get user details for each connection
    const connectionsWithUserDetails = await Promise.all(
      acceptedConnections.map(async (connection) => {
        const otherUserId = connection.fromUserId === loggedInUser.id 
          ? connection.toUserId 
          : connection.fromUserId;
        
        const otherUser = await UserModel.findById(otherUserId);
        if (!otherUser) return null;
        
        const otherUserWithUrls = await generateUserPhotoUrls(otherUser);
        
        return {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          photo: otherUserWithUrls.photo1,
          about: otherUser.about,
          age: otherUser.age,
          gender: otherUser.gender
        };
      })
    );

    // Filter out null values
    const validConnections = connectionsWithUserDetails.filter(user => user !== null);

    res.status(200).json({ 
      message: "Connection data fetched", 
      data: validConnections 
    });
  } catch (error) {
    res.status(400).send("ERROR : " + (error as Error).message);
  }
});

export default userRouter; 