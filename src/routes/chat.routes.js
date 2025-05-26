import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/chat.controller.js";
import {
  verifyUserJWT,
  verifyRiderJWT,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/:chatId/send-user",
  verifyUserJWT,
  (req, res, next) => {
    req.userRole = "user";
    next();
  },
  sendMessage
);

router.post(
  "/:chatId/send-rider",
  verifyRiderJWT,
  (req, res, next) => {
    req.userRole = "rider";
    next();
  },
  sendMessage
);

router.get("/:chatId/messages-user", verifyUserJWT, getMessages);
router.get("/:chatId/messages-rider", verifyRiderJWT, getMessages);

export default router;
