import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAllOrders,
  getAllMyRiders,
  updateAdminProfile,
  registerRider,
  assignRiderToOrder,
} from "../controllers/admin.controller.js";

import { verifyAdminJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

router.post("/logout", verifyAdminJWT, logoutAdmin);
router.get("/orders", verifyAdminJWT, getAllOrders);
router.patch("/update", verifyAdminJWT, updateAdminProfile);
router.get("/riders", verifyAdminJWT, getAllMyRiders);
router.patch("/assign-order/:orderId", verifyAdminJWT, assignRiderToOrder);

router.post(
  "/create-rider",
  verifyAdminJWT,
  upload.single("avatar"),
  registerRider
);

export default router;
