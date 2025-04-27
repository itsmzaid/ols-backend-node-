import { Router } from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";
import { verifyUserJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyUserJWT);

router.post("/add", addToCart);
router.get("/", getCart);
router.put("/update", updateCartItem);
router.delete("/remove/:itemId", removeCartItem);
router.delete("/clear", clearCart);

export default router;
