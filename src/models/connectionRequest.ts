/**
 * @deprecated This MongoDB connection request model is deprecated.
 * Use SQL-based connection request management instead.
 * This file will be removed in a future update.
 */

// MongoDB Connection Request Model - commented out
/*
import mongoose, { Schema, Document } from 'mongoose';
import UserModel from './user';
import { IConnectionRequest, IUser } from '../types';

const connectionRequestSchema = new Schema<IConnectionRequest>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: "User", // reference to the User collection
      required: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromUserName: {
      type: String,
    },
    toUserName: {
      type: String,
    },
    status: {
      type: String,
      enum: {
        values: ["ignore", "accepted", "rejected", "interested"],
      },
      required: true,
    },
  },
  { timestamps: true }
);

connectionRequestSchema.pre("save", async function (next) {
  const connectionRequest = this as IConnectionRequest & Document;
  // Check if fromUser is same as toUser
  if (connectionRequest.fromUserId.toString() === connectionRequest.toUserId.toString()) {
    throw new Error("You cannot send a connection request to yourself");
  }
  // Add the userName to schema and DB
  if (!this.fromUserName || !this.toUserName) {
    const [fromUser, toUser] = await Promise.all([
      UserModel.findById(this.fromUserId).select("firstName"),
      UserModel.findById(this.toUserId).select("firstName"),
    ]);

    if (!fromUser || !toUser) {
      throw new Error("User not found when putting usernames.");
    }

    this.fromUserName = fromUser.firstName;
    this.toUserName = toUser.firstName;
  }
  next();
});

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

const ConnectionRequestModel = mongoose.model<IConnectionRequest>(
  "ConnectionRequest",
  connectionRequestSchema
);

export default ConnectionRequestModel;
*/

// Temporary placeholder - will be replaced with SQL implementation
const ConnectionRequestModel = {
  find: () => Promise.resolve([]),
  findOne: () => Promise.resolve(null),
  create: () => Promise.resolve({}),
};

export default ConnectionRequestModel; 