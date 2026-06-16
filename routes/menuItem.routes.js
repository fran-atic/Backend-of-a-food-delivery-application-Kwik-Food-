import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWTRestaurant } from "../middlewares/authRestaurant.middleware.js";
import { addMenuItem, deleteMenuItem, getAllMenuItems, updateMenuItem } from "../controllers/menu_item.controller.js";

const router = Router()

router.route("/add-menu-item").post(upload.none(), verifyJWTRestaurant, addMenuItem)   // fine
router.route("/update-menu-item").patch(upload.none(), verifyJWTRestaurant, updateMenuItem)  // fine
router.route("/get-all-menu-items").post(upload.none(), verifyJWTRestaurant, getAllMenuItems)  // fine
router.route("/delete-menu-item").post(upload.none(), verifyJWTRestaurant, deleteMenuItem)  // fine

export default router