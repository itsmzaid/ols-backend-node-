import { Router } from "express";
import {
  createItem,
  getAllItems,
  getItemsByServiceType,
  updateItem,
  deleteItem,
} from "../controllers/item.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/create", upload.single("avatar"), createItem);
router.get("/", getAllItems);
router.get("/service-type/:serviceType", getItemsByServiceType);
router.put("/:itemId", upload.single("avatar"), updateItem);
router.delete("/:itemId", deleteItem);

export default router;
