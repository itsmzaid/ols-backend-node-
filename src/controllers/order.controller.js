import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { UserLocation } from "../models/location.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { paymentMethod, pickupDate, pickupTime } = req.body;

  const location = await UserLocation.findOne({ user: userId });
  if (!location) {
    throw new ApiError(
      400,
      "Location not set. Please set your location first."
    );
  }

  const cart = await Cart.findOne({ user: userId }).populate("items.item");
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const subTotal = cart.items.reduce(
    (total, item) => total + item.quantity * item.item.price,
    0
  );

  const shippingPrice = location.shippingRate;
  const total = subTotal + shippingPrice;

  const order = await Order.create({
    user: userId,
    items: cart.items,
    location,
    paymentMethod,
    pickupDate: new Date(pickupDate),
    pickupTime: new Date(pickupTime),
    shippingPrice,
    subTotal,
    total,
    status: "pending",
  });

  cart.items = [];
  await cart.save();

  res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.item")
    .populate("rider", "name email phoneNo avatar");

  res
    .status(200)
    .json(new ApiResponse(200, orders, "My orders fetched successfully"));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.item")
    .populate("rider", "name email phoneNo avatar");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res.status(200).json(new ApiResponse(200, order, "Order details fetched"));
});

export const assignRider = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { riderId } = req.body;

  if (!riderId) {
    throw new ApiError(400, "Rider ID is required");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.rider = riderId;
  order.status = "confirmed";
  await order.save();

  res
    .status(200)
    .json(new ApiResponse(200, order, "Rider assigned successfully"));
});
