import { Router } from "express";
import { getOrderStatusId, setOrderStatus } from "../controllers/order_status.controller.js";

const router = Router()

router.route("/set-order-status").post(setOrderStatus)    // fine
router.route("/get-order-status-id").post(getOrderStatusId)  // fine

export default router