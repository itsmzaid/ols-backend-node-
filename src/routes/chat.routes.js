import { Router } from "express";
import { sendMessage } from "../controllers/message.controller.js";
import {
  verifyUserJWT,
  verifyRiderJWT,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/send-user", verifyUserJWT, sendMessage);
router.post("/send-rider", verifyRiderJWT, sendMessage);

// router.get("/:chatId/messages-user", verifyUserJWT, getMessages);
// router.get("/:chatId/messages-rider", verifyRiderJWT, getMessages);

export default router;
