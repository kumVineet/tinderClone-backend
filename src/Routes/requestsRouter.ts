import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth';
import ConnectionRequestModel from '../models/connectionRequestSQL';
import UserModel from '../models/userSQL';
import { AuthenticatedRequest } from '../types';

const requestsRouter = express.Router();

requestsRouter.post("/send/:status/:toUserId", userAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const fromUser = req.user!.id;
    const toUserId = parseInt(req.params.toUserId);
    const status = req.params.status as 'ignore' | 'interested';

    const allowedStatuses = ["ignore", "interested"];
    if (!allowedStatuses.includes(status)) {
      res.status(400).send({ message: "Invalid status" });
      return;
    }

    // Check if the target user is valid
    const toUser = await UserModel.findById(toUserId);
    if (!toUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if user is trying to send request to themselves
    if (fromUser === toUserId) {
      res.status(400).send({ message: "You cannot send a connection request to yourself" });
      return;
    }

    // Create the connection request
    const connectionRequest = await ConnectionRequestModel.create({
      fromUserId: fromUser,
      toUserId: toUserId,
      status: status,
    });

    res.json({
      message: `${req.user!.firstName} is ${status} ${toUser.firstName}`,
      data: connectionRequest,
    });
  } catch (error) {
    res.status(400).send("ERROR : " + (error as Error).message);
  }
});

requestsRouter.post(
  "/review/:status/:requestId",
  userAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const loggedInUser = req.user!;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        res.status(400).json({ message: "Status not allowed!" });
        return;
      }

      const requestIdNum = parseInt(requestId);
      const connectionRequest = await ConnectionRequestModel.findById(requestIdNum);
      
      if (!connectionRequest) {
        res.status(404).json({ message: "No connection request" });
        return;
      }

      // Check if the logged-in user is the recipient of this request
      if (connectionRequest.toUserId !== loggedInUser.id) {
        res.status(403).json({ message: "You can only review requests sent to you" });
        return;
      }

      // Check if request is in interested status
      if (connectionRequest.status !== 'interested') {
        res.status(400).json({ message: "Request is not in interested status" });
        return;
      }

      // Update the request status
      const updatedRequest = await ConnectionRequestModel.update(requestIdNum, {
        status: status as 'accepted' | 'rejected'
      });

      if (!updatedRequest) {
        res.status(500).json({ message: "Failed to update request" });
        return;
      }

      res.status(201).json({ message: "Connection Request " + status, data: updatedRequest });
    } catch (error) {
      res.status(400).send("ERROR : " + (error as Error).message);
    }
  }
);

export default requestsRouter; 