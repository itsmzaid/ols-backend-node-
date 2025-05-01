import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
  {
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    location: {
      address: String,
      latitude: Number,
      longitude: Number,
    },
    paymentMethod: { type: String, required: true },
    pickupDate: { type: String, required: true },
    pickupTime: { type: String, required: true },
    shippingPrice: { type: Number, required: true },
    subTotal: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivering", "delivered"],
      default: "pending",
    },
    rider: { type: Schema.Types.ObjectId, ref: "Rider" },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
