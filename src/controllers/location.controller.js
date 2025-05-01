import { UserLocation } from "../models/location.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { getDistanceInKm } from "../utils/distance.utils.js";

const adminLocation = {
  latitude: 31.491394911372183,
  longitude: 74.23846953839717,
};
const shippingRatePerKm = 50;

export const setUserLocation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { address, latitude, longitude } = req.body;

  if (!address || !latitude || !longitude) {
    throw new ApiError(400, "Address, latitude and longitude are required");
  }

  const distance = getDistanceInKm(
    adminLocation.latitude,
    adminLocation.longitude,
    latitude,
    longitude
  );

  const shippingRate = Math.round(distance * shippingRatePerKm);

  const updated = await UserLocation.findOneAndUpdate(
    { user: userId },
    { address, latitude, longitude, shippingRate },
    { new: true, upsert: true }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updated,
        "Location saved and shipping rate calculated"
      )
    );
});
