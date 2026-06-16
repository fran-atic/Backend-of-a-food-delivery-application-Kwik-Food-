import { Router } from "express";
import { verifyJWTCustomer } from "../middlewares/authCustomer.middleware.js";
import { addItemToOrder, clearAllItemsFromOrder, getAllItemsForOrder, removeItemFromOrder, updateItemOrder } from "../controllers/order_menu_item.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/add-item-to-order").post(upload.none(), verifyJWTCustomer, addItemToOrder) // fine
router.route("/update-item-order").patch(upload.none(), verifyJWTCustomer, updateItemOrder) // fine
router.route("/remove-item-from-order").patch(upload.none(), verifyJWTCustomer, removeItemFromOrder)  // fine
router.route("/get-all-items-for-order").post(upload.none(), verifyJWTCustomer, getAllItemsForOrder) // fine 
router.route("/clear-all-items-from-order").post(upload.none(), verifyJWTCustomer, clearAllItemsFromOrder) // fine

export default router