import express from "express";
import {
  getAllBoats,
  addBoat,
  updateBoat,
  deleteBoat,
} from "../controllers/boats.controller.js";
import protect from "../middlewares/auth.middleware.js";
import upload from "../lib/multer.js";

const router = express.Router();

router.get("/", getAllBoats);

router.post("/", protect, upload.single("image"), addBoat);
router.put("/:id", protect, upload.single("image"), updateBoat);
router.delete("/:id", protect, deleteBoat);

export default router;
