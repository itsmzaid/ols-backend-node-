import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Token Generator
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNo } = req.body;
  const avatarPath = req.file?.path;

  if (!name || !email || !password || !phoneNo) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "Email already in use");
  }

  const user = await User.create({
    name,
    email,
    password,
    phoneNo,
    avatar: avatarPath || "",
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = { httpOnly: true, secure: true };
  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        { user: safeUser, accessToken, refreshToken },
        "User registered & logged in successfully"
      )
    );
});

// Login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log(req.body);

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = { httpOnly: true, secure: true };
  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: safeUser, accessToken, refreshToken },
        "Logged in successfully"
      )
    );
});

// Logout
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  const options = { httpOnly: true, secure: true, sameSite: "Strict" };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// Refresh Token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token provided");

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== token) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
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

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"));
});

// Update Account
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNo, password } = req.body;

  if (!password) {
    throw new ApiError(400, "Password is required to update account");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // Update only provided fields
  if (fullName) user.fullName = fullName;
  if (email) user.email = email;
  if (phoneNo) user.phoneNo = phoneNo;

  await user.save({ validateBeforeSave: false });

  const safeUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, safeUser, "Profile updated successfully"));
});

// Change Password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!(await user.isPasswordCorrect(oldPassword))) {
    throw new ApiError(400, "Incorrect current password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Password changed"));
});

// Update Avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarPath = req.file?.path;
  if (!avatarPath) {
    throw new ApiError(400, "Avatar file missing");
  }

  const user = await User.findById(req.user._id).select("-password");
  user.avatar = avatarPath;
  await user.save();

  return res.status(200).json(new ApiResponse(200, user, "Avatar updated"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
};
