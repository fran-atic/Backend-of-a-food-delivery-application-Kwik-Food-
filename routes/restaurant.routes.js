import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { changeOrderStatus, deleteRestaurantAddress, getCurrentRestaurant, getRestaurantAddress, loginRestaurant, logoutRestaurant, refreshRestaurantRefreshToken, registerRestaurant, updateCurrentPassword, updateRestaurantAddress, updateRestaurantDetails } from "../controllers/restaurant.controller.js";
import { verifyJWTRestaurant } from "../middlewares/authRestaurant.middleware.js";

const router = Router()

router.route("/register").post(upload.none(), registerRestaurant)  // fine
router.route("/login").post(loginRestaurant)  // fine

// secured routes
router.route("/logout").get(verifyJWTRestaurant, logoutRestaurant)   // fine
router.route("/update-password").post(verifyJWTRestaurant, updateCurrentPassword)   // fine
router.route("/update-restaurant-details").patch(verifyJWTRestaurant, updateRestaurantDetails)  // fine
router.route("/refresh-restaurant-refresh-token").get(verifyJWTRestaurant, refreshRestaurantRefreshToken)    // fine
router.route("/get-current-restaurant").get(verifyJWTRestaurant, getCurrentRestaurant) // fine
router.route("/get-restaurant-address").post(verifyJWTRestaurant, getRestaurantAddress)  // fine
router.route("/update-restaurant-address").patch(upload.none(), verifyJWTRestaurant, updateRestaurantAddress)  // fine
router.route("/delete-restaurant-address").get(verifyJWTRestaurant, deleteRestaurantAddress)  // fine
router.route("/change-order-status").patch(upload.none(), verifyJWTRestaurant, changeOrderStatus) // fine

export default router



