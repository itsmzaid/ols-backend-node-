import { Router } from "express";
import {
  loginRider,
  logoutRider,
  refreshAccessTokenRider,
  changeCurrentPasswordRider,
  getCurrentRider,
  updateAccountDetailsRider,
  updateRiderAvatar,
  updateRiderStatus,
  getRiderOrders,
  markOrderStatus,
} from "../controllers/rider.controller.js";
import { verifyRiderJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/login", loginRider);
router.post("/logout", verifyRiderJWT, logoutRider);
router.post("/refresh-token", refreshAccessTokenRider);
router.post("/change-password", verifyRiderJWT, changeCurrentPasswordRider);
router.get("/current-rider", verifyRiderJWT, getCurrentRider);
router.post("/update-account", verifyRiderJWT, updateAccountDetailsRider);
router.post(
  "/avatar",
  verifyRiderJWT,
  upload.single("avatar"),
  updateRiderAvatar
);
router.patch("/status", verifyRiderJWT, updateRiderStatus);
router.get("/orders", verifyRiderJWT, getRiderOrders);
router.patch("/order/:orderId", verifyRiderJWT, markOrderStatus);
export default router;
