import { User } from "../models/user.model.js";
import { Rider } from "../models/rider.model.js";
import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET environment variable not set");
}

const verifyToken = (model, role) =>
  asyncHandler(async (req, _, next) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(new ApiError(401, "Unauthorized Request: No token provided"));
    }

    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await model
        .findById(decodedToken?._id)
        .select("-password -refreshToken");

      if (!user) {
        return next(new ApiError(401, "Invalid access token: User not found"));
      }

      req.user = user;
      req.userRole = role;

      if (role === "user") req.userId = user._id;
      if (role === "rider") req.riderId = user._id;
      if (role === "admin") req.adminId = user._id;

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(new ApiError(401, "Access token expired"));
      } else if (error.name === "JsonWebTokenError") {
        return next(
          new ApiError(401, "Invalid access token: Invalid signature")
        );
      } else {
        return next(new ApiError(401, error.message || "Invalid access token"));
      }
    }
  });

export const verifyUserJWT = verifyToken(User, "user");
export const verifyRiderJWT = verifyToken(Rider, "rider");
export const verifyAdminJWT = verifyToken(Admin, "admin");
