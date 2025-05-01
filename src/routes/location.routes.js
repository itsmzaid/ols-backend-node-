import { Router } from "express";
import { setUserLocation } from "../controllers/location.controller.js";
import { verifyUserJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyUserJWT);

router.post("/set", setUserLocation);

export default router;
