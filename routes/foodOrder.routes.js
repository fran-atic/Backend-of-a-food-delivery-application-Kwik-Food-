import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWTCustomer } from "../middlewares/authCustomer.middleware.js";
import { assignDriverRating, assignOrderDatetimeAndRequestedDeliveryTime, assignRestaurantRating, calculateTotalAmount, createFoodOrder, getFoodOrderById} from "../controllers/food_order.controller.js";


const router = Router()

router.route("/create-food-order").post(upload.none(), verifyJWTCustomer, createFoodOrder) // fine
router.route("/get-food-order").post(upload.none(), verifyJWTCustomer, getFoodOrderById)  // fine
router.route("/calculate-total-amount-and-delivery-fee").post(upload.none(), verifyJWTCustomer, calculateTotalAmount) // fine
router.route("/assign-driver-rating").post(upload.none(), verifyJWTCustomer, assignDriverRating)  // fine
router.route("/assign-restaurant-rating").post(upload.none(), verifyJWTCustomer, assignRestaurantRating) // fine
router.route("/assign-order-date-time-and-requested-delivery-date-time").patch(upload.none(), verifyJWTCustomer, assignOrderDatetimeAndRequestedDeliveryTime) // fine

export default router
