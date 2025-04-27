import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
    },
    serviceType: {
      type: String,
      required: [true, "Service type is required"],
      enum: ["wash", "iron", "dryClean", "fullWash"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Item price is required"],
      min: [0, "Price cannot be negative"],
    },
    avatar: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.index({ serviceType: 1 });

export const Item = mongoose.model("Item", itemSchema);
