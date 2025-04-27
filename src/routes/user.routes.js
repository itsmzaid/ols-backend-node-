import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
} from "../controllers/user.controller.js";
import { verifyUserJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyUserJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/change-password", verifyUserJWT, changeCurrentPassword);
router.get("/current-user", verifyUserJWT, getCurrentUser);
router.post("/update-account", verifyUserJWT, updateAccountDetails);
router.post(
  "/avatar",
  verifyUserJWT,
  upload.single("avatar"),
  updateUserAvatar
);

export default router;
