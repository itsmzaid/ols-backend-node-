import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Rider } from "../models/rider.model.js"; // Rider model import
import jwt from "jsonwebtoken";

// Token Generator
const generateAccessAndRefreshTokenRider = async (riderId) => {
  try {
    const rider = await Rider.findById(riderId);
    const accessToken = rider.generateAccessToken();
    const refreshToken = rider.generateRefreshToken();

    rider.refreshToken = refreshToken;
    await rider.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens for rider");
  }
};

// Login Rider
const loginRider = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const rider = await Rider.findOne({ email });
  if (!rider || !(await rider.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokenRider(rider._id);

  const options = { httpOnly: true, secure: true };
  const safeRider = await Rider.findById(rider._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { rider: safeRider, accessToken, refreshToken },
        "Logged in successfully"
      )
    );
});

// Logout Rider
const logoutRider = asyncHandler(async (req, res) => {
  await Rider.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  const options = { httpOnly: true, secure: true, sameSite: "Strict" };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// Refresh Token
const refreshAccessTokenRider = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token provided");

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const rider = await Rider.findById(decoded._id);
    if (!rider || rider.refreshToken !== token) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokenRider(rider._id);
    const options = { httpOnly: true, secure: true };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, { accessToken, refreshToken }, "Token refreshed")
      );
  } catch (err) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

// Get Current Rider
const getCurrentRider = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current rider fetched"));
});

// Update Account
const updateAccountDetailsRider = asyncHandler(async (req, res) => {
  const { name, email, phoneNo, cnic, licenseNumber, password } = req.body;
  if (!password) {
    throw new ApiError(400, "Password is required to update account");
  }
  const rider = await Rider.findById(req.user._id);
  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }
  const isPasswordValid = await rider.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  if (name) rider.name = name;
  if (email) rider.email = email;
  if (phoneNo) rider.phoneNo = phoneNo;
  if (cnic) rider.cnic = cnic;
  if (licenseNumber) rider.licenseNumber = licenseNumber;

  await rider.save({ validateBeforeSave: false });
  const safeRider = await Rider.findById(rider._id).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, safeRider, "Profile updated successfully"));
});

// Change Password
const changeCurrentPasswordRider = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const rider = await Rider.findById(req.user._id);

  if (!(await rider.isPasswordCorrect(oldPassword))) {
    throw new ApiError(400, "Incorrect current password");
  }

  rider.password = newPassword;
  await rider.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Password changed"));
});

// Update Avatar
const updateRiderAvatar = asyncHandler(async (req, res) => {
  const avatarPath = req.file?.path;
  if (!avatarPath) {
    throw new ApiError(400, "Avatar file missing");
  }

  const rider = await Rider.findById(req.user._id).select("-password");
  rider.avatar = avatarPath;
  await rider.save();

  return res.status(200).json(new ApiResponse(200, rider, "Avatar updated"));
});

const updateRiderStatus = asyncHandler(async (req, res) => {
  const riderId = req.user._id;
  const { status } = req.body;

  if (!["Active", "Inactive"].includes(status)) {
    throw new ApiError(
      400,
      "Invalid status. It should be either 'Active' or 'Inactive'"
    );
  }

  const rider = await Rider.findByIdAndUpdate(
    riderId,
    { status },
    { new: true }
  );

  if (!rider) {
    throw new ApiError(404, "Rider not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, rider, `Rider status updated to ${status}`));
});

export {
  loginRider,
  logoutRider,
  refreshAccessTokenRider,
  changeCurrentPasswordRider,
  getCurrentRider,
  updateAccountDetailsRider,
  updateRiderAvatar,
  updateRiderStatus,
};
