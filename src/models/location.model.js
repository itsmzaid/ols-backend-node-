import mongoose, { Schema } from "mongoose";

const userLocationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    shippingRate: { type: Number, required: true },
    assignedAdmin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

export const UserLocation = mongoose.model("UserLocation", userLocationSchema);
