import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { changeCurrentPassword, getCurrentCustomer, loginCustomer, logoutCustomer, refreshAccessToken, registerCustomer, updateAccountDetails, updateCustomerAvatar } from "../controllers/customer.controller.js";
import { verifyJWTCustomer } from "../middlewares/authCustomer.middleware.js";

const router = Router()

router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }
]), registerCustomer)  // fine

router.route("/login").post(loginCustomer)     // fine                        

// secured routes
router.route("/logout").post(verifyJWTCustomer, logoutCustomer)    // fine         
router.route("/refresh-token").post(verifyJWTCustomer, refreshAccessToken)    // fine
router.route("/change-password").post(verifyJWTCustomer, changeCurrentPassword)  // fine
router.route("/get-current-customer").get(verifyJWTCustomer, getCurrentCustomer)  // fine
router.route("/update-account-details").post(verifyJWTCustomer, updateAccountDetails)   // fine
router.route("/update-customer-avatar").patch(verifyJWTCustomer, upload.single("avatar"), updateCustomerAvatar)  // fine

export default router