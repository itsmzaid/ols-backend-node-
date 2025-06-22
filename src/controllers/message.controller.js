import { Message } from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

let io;
export const setSocketIOInstance = (ioInstance) => {
  io = ioInstance;
};

// Send message
const sendMessage = asyncHandler(async (req, res) => {
  var { content, receiverId } = req.body;

  var senderId = "";

  if (req.userRole === "user") {
    senderId = req.userId;
  } else if (req.userRole === "rider") {
    senderId = req.riderId;
  }

  receiverId = new mongoose.Types.ObjectId(receiverId);
  senderId = new mongoose.Types.ObjectId(senderId);

  const message = await Message.create({
    receiverId,
    senderId,
    content,
  });

  res.status(201).json(new ApiResponse(201, message, "Message sent"));
});

// Get chat messages
const getMessages = asyncHandler(async (req, res) => {

  const { receiverId } = req.params;

  var senderId = "";

  if (req.userRole === "user") {
    senderId = req.userId;
  } else if (req.userRole === "rider") {
    senderId = req.riderId;
  }

  const messages = await Message.find({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId }
    ]
  }).sort({ createdAt: 1 });

  res.status(200).json(new ApiResponse(200, messages, "Messages fetched"));
});

export { sendMessage, getMessages };
