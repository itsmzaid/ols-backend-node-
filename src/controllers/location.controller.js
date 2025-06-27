import { UserLocation } from "../models/location.model.js";
import { Admin } from "../models/admin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getDistanceInKm } from "../utils/distance.utils.js";

const shippingRatePerKm = 40;

export const setUserLocation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { address, latitude, longitude } = req.body;

  if (!address || !latitude || !longitude) {
    throw new ApiError(400, "Address, latitude and longitude are required");
  }

  const admins = await Admin.find({ location: { $exists: true } });

  if (admins.length === 0) {
    throw new ApiError(500, "No admin location available");
  }

  let nearestAdmin = null;
  let minDistance = Infinity;

  for (const admin of admins) {
    const dist = getDistanceInKm(
      admin.location.latitude,
      admin.location.longitude,
      latitude,
      longitude
    );

    if (dist < minDistance) {
      minDistance = dist;
      nearestAdmin = admin;
    }
  }

  const shippingRate = Math.round(minDistance * shippingRatePerKm);

  const updated = await UserLocation.findOneAndUpdate(
    { user: userId },
    {
      address,
      latitude,
      longitude,
      shippingRate,
      assignedAdmin: nearestAdmin._id,
    },
    { new: true, upsert: true }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updated,
        "Location saved, shipping calculated, nearest admin assigned"
      )
    );
});
