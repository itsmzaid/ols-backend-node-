import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderType: { type: String, enum: ["user", "rider"], required: true },
    senderId: { type: Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
