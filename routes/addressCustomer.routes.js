import { Router } from "express";
import { verifyJWTCustomer } from "../middlewares/authCustomer.middleware.js";
import { deleteCustomerAddress, fillCustomerAddress, getCustomerAddress, updateCustomerAddress } from "../controllers/customer_address.controller.js";
import { addCountry } from "../controllers/country.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/add-country").post(upload.none(), verifyJWTCustomer, addCountry)  // fine
router.route("/fill-customerAddress").post(upload.none(), verifyJWTCustomer, fillCustomerAddress)  // fine
router.route("/get-customerAddress").get(verifyJWTCustomer, getCustomerAddress)  // fine
router.route("/update-customerAddress").post(upload.none(), verifyJWTCustomer, updateCustomerAddress)  // fine
router.route("/delete-customerAddress").get(verifyJWTCustomer, deleteCustomerAddress)  // fine


export default router;