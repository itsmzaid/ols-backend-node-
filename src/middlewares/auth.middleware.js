import { User } from "../models/user.model.js";
import { Rider } from "../models/rider.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET environment variable not set");
}

const verifyToken = (model) =>
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

export const verifyUserJWT = verifyToken(User);

export const verifyRiderJWT = verifyToken(Rider);
