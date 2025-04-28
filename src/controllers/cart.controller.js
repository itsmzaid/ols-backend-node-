import { Cart } from "../models/cart.model.js";
import { Item } from "../models/item.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Items array is required");
  }

  for (const cartItem of items) {
    const itemExists = await Item.findById(cartItem.item);
    if (!itemExists) {
      throw new ApiError(404, `Item not found with ID: ${cartItem.item}`);
    }
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items });
  } else {
    for (const newItem of items) {
      const existingItemIndex = cart.items.findIndex(
        (i) => i.item.toString() === newItem.item
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += newItem.quantity;
      } else {
        cart.items.push(newItem);
      }
    }
    await cart.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Items added to cart successfully"));
});

export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId }).populate("items.item");

  if (!cart) {
    return res
      .status(200)
      .json(new ApiResponse(200, { items: [] }, "User cart is empty"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "User cart fetched successfully"));
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId, quantity } = req.body;

  if (!itemId || !quantity) {
    throw new ApiError(400, "Item ID and Quantity are required");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.find((i) => i.item.toString() === itemId);

  if (!item) {
    throw new ApiError(404, "Item not found in cart");
  }

  item.quantity = quantity;
  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart item updated successfully"));
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = cart.items.filter((i) => i.item.toString() !== itemId);

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Item removed from cart successfully"));
});

export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = [];
  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Cart cleared successfully"));
});
