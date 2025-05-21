import { Admin } from "../models/admin.model.js";
import { Rider } from "../models/rider.model.js";
import { Order } from "../models/order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Register
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existing = await Admin.findOne({ email });
  if (existing) throw new ApiError(409, "Admin already exists");

  const admin = await Admin.create({ name, email, password });
  res.status(201).json(new ApiResponse(200, admin, "Admin registered"));
});

// Login
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new ApiError(400, "Email and Password are required");

  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();
  admin.refreshToken = refreshToken;
  await admin.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken,
        refreshToken,
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          phoneNo: admin.phoneNo,
          location: admin.location,
        },
      },
      "Admin logged in"
    )
  );
});

// Logout
export const logoutAdmin = asyncHandler(async (req, res) => {
  const adminId = req.user._id;
  const admin = await Admin.findById(adminId);
  if (!admin) throw new ApiError(404, "Admin not found");

  admin.refreshToken = null;
  await admin.save();

  res.status(200).json(new ApiResponse(200, null, "Admin logged out"));
});

// Get all orders (assigned to this admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ assignedAdmin: req.user._id })
    .populate("user", "fullName email phoneNo")
    .populate("rider", "name phoneNo email avatar")
    .populate("items.item");

  res
    .status(200)
    .json(
      new ApiResponse(200, orders, "Orders assigned to this admin fetched")
    );
});

// Get all riders

export const getAllMyRiders = asyncHandler(async (req, res) => {
  const riders = await Rider.find({ createdBy: req.user._id }).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, riders, "Riders fetched successfully"));
});

export const registerRider = asyncHandler(async (req, res) => {
  const { name, email, address, password, phoneNo, cnic, licenseNumber } =
    req.body;
  const avatarPath = req.file?.path;

  if (
    !name ||
    !email ||
    !address ||
    !password ||
    !phoneNo ||
    !cnic ||
    !licenseNumber ||
    !avatarPath
  ) {
    throw new ApiError(400, "All fields are required for rider registration");
  }

  const existedRider = await Rider.findOne({ email });
  if (existedRider) {
    throw new ApiError(409, "Email already in use");
  }

  const rider = await Rider.create({
    name,
    email,
    password,
    phoneNo,
    address,
    cnic,
    licenseNumber,
    avatar: avatarPath,
    createdBy: req.user._id,
  });

  const safeRider = await Rider.findById(rider._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .json(
      new ApiResponse(200, { rider: safeRider }, "Rider created successfully")
    );
});

// Update profile
export const updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id);
  if (!admin) throw new ApiError(404, "Admin not found");

  const { name, email, phoneNo, location, password } = req.body;

  if (name) admin.name = name;
  if (email) admin.email = email;
  if (phoneNo) admin.phoneNo = phoneNo;

  if (location) admin.location = location;
  if (password) admin.password = password;

  await admin.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phoneNo: admin.phoneNo,
        location: admin.location,
      },
      "Admin profile updated"
    )
  );
});

export const assignRiderToOrder = asyncHandler(async (req, res) => {
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

export const deleteOrderByAdmin = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.assignedAdmin?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this order");
  }

  await order.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Order deleted successfully"));
});
