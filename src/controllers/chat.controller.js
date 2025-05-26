import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

let io;
export const setSocketIOInstance = (ioInstance) => {
  io = ioInstance;
};

// Send message
const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.isActive) {
    throw new ApiError(403, "Chat is not active");
  }

  const senderType = req.userRole;
  const senderId = req.user._id;

  const message = await Message.create({
    chat: chatId,
    senderType,
    senderId,
    content,
  });

  io.to(chatId).emit("newMessage", {
    _id: message._id,
    chat: chatId,
    senderType,
    senderId,
    content,
    createdAt: message.createdAt,
  });

  res.status(201).json(new ApiResponse(201, message, "Message sent"));
});

// Get chat messages
const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.isActive) {
    throw new ApiError(404, "Chat not found or inactive");
  }

  const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 });

  res.status(200).json(new ApiResponse(200, messages, "Messages fetched"));
});

export { sendMessage, getMessages };
