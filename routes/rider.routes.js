import { Router } from "express";
import { assignDeliveryRider, changeCurrentPassword, changeOrderStatus, getAllOrdersWithStatusReady, getCurrentRider, loginRider, logoutRider, refreshAccessToken, registerRider, updateAccountDetails } from "../controllers/rider.controller.js";
import { verifyJWTRider } from "../middlewares/authRider.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/register").post(upload.none(), registerRider)   // fine
router.route("/login").post(upload.none(), loginRider)    // fine

// secured routes

router.route("/logout").get(verifyJWTRider, logoutRider)   // fine
router.route("/refresh-rider-refresh-token").get(verifyJWTRider, refreshAccessToken)  // fine
router.route("/change-password").post(verifyJWTRider, changeCurrentPassword)  // fine
router.route("/get-current-rider").get(verifyJWTRider, getCurrentRider)  // fine
router.route("/update-account-details").patch(upload.none(), verifyJWTRider, updateAccountDetails)  // fine
router.route("/get-all-orders-status-ready").get(verifyJWTRider, getAllOrdersWithStatusReady) // fine
router.route("/assign-delivery-rider").post(upload.none(), verifyJWTRider, assignDeliveryRider) // fine
router.route("/change-order-status").patch(upload.none(), verifyJWTRider, changeOrderStatus) // fine

export default router