import mongoose from "mongoose";
import { FoodOrder } from "../models/food_order.models.js";
import { OrderMenuItem } from "../models/order_menu_item.models.js";
import { OrderStatus } from "../models/order_status.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createFoodOrder = asyncHandler( async (req, res) => {
const {customer_id, restaurant_id, customer_address_id, order_status_id} = req.body
    const newOrder = await FoodOrder.create({
        customer_id,
        restaurant_id,
        customer_address_id,
        order_status_id
    })
    if(!newOrder){
      throw new ApiError(500, "Something went wrong while creating an order")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, newOrder, "Order created successfully"))
})

const getFoodOrderById = asyncHandler( async (req, res) => {
    const {order_id} = req.body;
    const order = await FoodOrder.findById(order_id)

    if(!order){
        throw new ApiError(500, "Order does not exist")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, order, "Order successfully fetched"))
})

const calculateTotalAmount = asyncHandler ( async (req, res) => {
    const {orderId} = req.body
    const result = await OrderMenuItem.aggregate([
        {
            $match: {
                order_id: new mongoose.Types.ObjectId(orderId)
            }
        },
        {
            $lookup: {
                from: "menuitems",
                localField: "menu_item_id",
                foreignField: "_id",
                as: "menu_item"
            }
        },
        {
            $unwind: "$menu_item"
        },
        {
            $addFields: {
                item_total: {
                    $multiply: ["$qty_ordered", "$menu_item.price"]
                }
            }
        },
        {
            $group: {
                _id: "$order_id",
                total_amount: {
                    $sum: "$item_total"
                },
                items: {
                    $push: {
                    item_name: "$menu_item.item_name",
                    price: "$menu_item.price",
                    qty: "$qty_ordered",
                    item_total: "$item_total"
                  }
            }
          }
        },
        {
            $addFields: {
                    delivery_fee: {
                        $round: [{ $multiply: ["$total_amount", 0.03] }, 2]
            },
            final_amount: {
                $round: [{ $add: ["$total_amount", { $multiply: ["$total_amount", 0.03] }] }, 2]
           }
         }
        }
]);
    

    if(result.length === 0) {
        throw new ApiError(500, "Cart is empty")
    }

    await FoodOrder.findByIdAndUpdate(
        orderId,
        {
            total_amount: result[0].total_amount,
            delivery_fee: result[0].delivery_fee,
            final_amount: result[0].final_amount
        }
    )

    return res
    .status(201)
    .json(new ApiResponse(201, result[0], "Total amount successfully calculated"))
})

const assignDriverRating = asyncHandler (async (req, res) => {
    const {orderId, driverRating} = req.body
    const updatedFoodOrder = await FoodOrder.findByIdAndUpdate(
        orderId,
        {
            cust_driver_rating: driverRating
        },
        {new: true}
    )

    if (!updatedFoodOrder) {
    throw new ApiError(404, "Order not found");
    }

     return res
    .status(201)
    .json(new ApiResponse(201, updatedFoodOrder, "Driver rating given successfully"))
})

const assignRestaurantRating = asyncHandler (async (req, res) => {
    const {orderId, restaurantRating} = req.body
    const updatedFoodOrder = await FoodOrder.findByIdAndUpdate(
        orderId,
        {
            cust_restaurant_rating: restaurantRating
        },
        {new: true}
    )

    return res
    .status(201)
    .json(new ApiResponse(201, updatedFoodOrder, "Restaurant rating given successfully"))
})

const assignOrderDatetimeAndRequestedDeliveryTime = asyncHandler( async (req, res) => {
    const {orderId, order_dateTime, requested_delivery_dateTime} = req.body

    const updatedFoodOrder = await FoodOrder.findByIdAndUpdate(
        orderId,
        {
            order_dateTime,
            requested_delivery_dateTime
        },
        {new : true}
    )

    if(!updatedFoodOrder){
        throw new ApiError(401, "Something went wrong while storing the order datetime and requested date time")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, updatedFoodOrder, "Order datetime and requested date time added successfully"))
})

export {
    createFoodOrder,
    getFoodOrderById,
    calculateTotalAmount,
    assignDriverRating,
    assignRestaurantRating,
    assignOrderDatetimeAndRequestedDeliveryTime
}