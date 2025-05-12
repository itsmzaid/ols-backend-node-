import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Item } from "../models/item.model.js";

// Create Item
const createItem = asyncHandler(async (req, res) => {
  const { title, serviceType, price } = req.body;
  const avatarPath = req.file?.filename || null;

  if (!title || !serviceType || !price) {
    throw new ApiError(400, "Title, ServiceType and Price are required");
  }

  const item = await Item.create({
    title,
    serviceType,
    price,
    avatar: avatarPath,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, item, "Item created successfully"));
});

// Get All Items
const getAllItems = asyncHandler(async (req, res) => {
  const items = await Item.find().sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, items, "All items fetched successfully"));
});

// Get Items by ServiceType
const getItemsByServiceType = asyncHandler(async (req, res) => {
  const { serviceType } = req.params;

  const items = await Item.find({ serviceType });

  if (!items.length) {
    throw new ApiError(404, "No items found for the given service type");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, items, "Items fetched by service type"));
});

// Update Item
const updateItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { title, serviceType, price } = req.body;
  const avatarPath = req.file?.path;

  const item = await Item.findById(itemId);
  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  if (title) item.title = title;
  if (serviceType) item.serviceType = serviceType;
  if (price) item.price = price;
  if (avatarPath) item.avatar = avatarPath;

  await item.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, item, "Item updated successfully"));
});

// Delete Item
const deleteItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const item = await Item.findById(itemId);
  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  await item.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Item deleted successfully"));
});

export {
  createItem,
  getAllItems,
  getItemsByServiceType,
  updateItem,
  deleteItem,
};
