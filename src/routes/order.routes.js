import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  assignRider,
} from "../controllers/order.controller.js";
import { verifyUserJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.patch("/assign/:orderId", assignRider);

router.use(verifyUserJWT);

router.post("/create", createOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);

export default router;
