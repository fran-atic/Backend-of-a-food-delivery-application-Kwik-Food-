import { OrderStatus } from "../models/order_status.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const setOrderStatus = asyncHandler( async (req, res) => {
    const {orderStatus} = req.body;

    const createdOrderStatus = await OrderStatus.create({
        status_value: orderStatus
    })

    if(!createdOrderStatus){
        throw new ApiError(401, "Something went wrong while storing the order status")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, createdOrderStatus, "Order status successfully created"))
})

const getOrderStatusId = asyncHandler( async (req, res) => {
    const {orderStatus} = req.body;

    const existingStatus = await OrderStatus.findOne({status_value: orderStatus})

    if(!existingStatus){
        throw new ApiError(401, "Something went wrong while fetching status ID")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, existingStatus._id, "Status ID fetched successfully"))
})

export {
    setOrderStatus,
    getOrderStatusId
}