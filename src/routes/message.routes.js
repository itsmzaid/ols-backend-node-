import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import {
  verifyUserJWT,
  verifyRiderJWT,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/send-user", verifyUserJWT, sendMessage);
router.post("/send-rider", verifyRiderJWT, sendMessage);

router.get("/get-user-messages/:receiverId", verifyUserJWT, getMessages);
router.get("/get-rider-messages/:receiverId", verifyRiderJWT, getMessages);

export default router;
