import { Router } from "express";
import {
  registerRider,
  loginRider,
  logoutRider,
  refreshAccessTokenRider,
  changeCurrentPasswordRider,
  getCurrentRider,
  updateAccountDetailsRider,
  updateRiderAvatar,
} from "../controllers/rider.controller.js";
import { verifyRiderJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/register", upload.single("avatar"), registerRider);
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

export default router;
