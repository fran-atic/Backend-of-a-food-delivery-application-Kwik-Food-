import jwt from "jsonwebtoken"
import { Rider } from "../models/rider.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { OrderStatus } from "../models/order_status.models.js";
import { FoodOrder } from "../models/food_order.models.js";

const generateAccessAndRefreshTokens = async(riderId) => {
   try {
      const rider = await Rider.findById(riderId);
      
      const accessToken = rider.generateAccessToken()      
      const refreshToken = rider.generateRefreshToken()
      
      rider.refreshToken = refreshToken
      await rider.save({validateBeforeSave: false})

      return {accessToken, refreshToken}

   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
   }
}

const registerRider = asyncHandler ( async (req, res) => {
   const {firstName, lastName, email, username, password} = req.body

   if(
    [firstName, lastName, email, username, password].some((field) => field?.trim() === "")
   ){
    throw new ApiError(400, "All fields are required")
   }

   const existedRider = await Rider.findOne({
    $or: [{ username }, { email }]
   })

   if(existedRider){
    throw new ApiError(409, "Rider with email or username already exists")
   }


   const rider = await Rider.create({
    firstName,
    lastName,
    username: username.toLowerCase(),
    password,
    email,
   })

   const createdRider = await Rider.findById(rider._id).select(
    "-password -refreshToken"
   )

   if(!createdRider){
    throw new ApiError(500, "Something went wrong while registering the rider");
   }

   return res.status(201).json(
    new ApiResponse(200, createdRider, "Rider registed successfully")
   )
})

const loginRider = asyncHandler (async (req, res) => {
    const {email, username, password} = req.body
    
    if(!username && !email){
        throw new ApiError(400, "username or password is required")
    }

    const rider = await Rider.findOne({
        $or: [{username}, {email}]
    })

    if(!rider){
        throw new ApiError(404, "Rider does not exist")
    }

    const isPasswordValid = await rider.isPasswordCorrect(password)

    
    
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid rider credentials")
    }
 
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(rider._id);
    
    const loggedInRider = await Rider.findById(rider._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
            rider: loggedInRider, accessToken, refreshToken
            },
            "Rider logged In Successfully"
        )
    )
})

const logoutRider = asyncHandler (async (req, res) => {
    await Rider.findByIdAndUpdate(
          req.rider._id,
          {
             $set: {
                refreshToken: undefined
             }
          },
          {
             new: true
          }
      )
    
      const options = {
       httpOnly: true,
       secure: true
      }
    
      return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "Rider logged Out"))
})

const refreshAccessToken = asyncHandler (async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const rider = await Rider.findById(decodedToken?._id)
    
        if(!rider){
            throw new ApiError(401, "Invalid refresh token")
        }
        
        if(incomingRefreshToken !== rider?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(rider._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
            200,
            {accessToken, refreshToken},
            "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler (async (req, res) => {
    const {oldPassword, newPassword} = req.body
       
    const rider = await Rider.findById(req.rider?._id)

    const isPasswordCorrect = await rider.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    rider.password = newPassword
    await rider.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentRider = asyncHandler (async (req, res) => {
    return res
   .status(200)
   .json(new ApiResponse(200, req.rider, "current rider fetched successfully"))
})

const updateAccountDetails = asyncHandler (async (req, res) => {
    const {firstName, lastName, username, email} = req.body;

    if(!firstName || !lastName || !email || !username){
        throw new ApiError(400, "All fields are required")
    }

    const rider = await Rider.findByIdAndUpdate(
        req.rider?._id,
        {
            $set: {
            firstName,
            lastName,
            email: email,
            username
            }
        },
        {new :true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, rider, "Account details updated successfully"))
})

const getAllOrdersWithStatusReady = asyncHandler ( async (req, res) => {
    const statusId = await OrderStatus.findOne({status_value: 'Ready'})    
    
    const existedOrderWithStatusReady = await FoodOrder.find({order_status_id: statusId._id})
    

    if(!existedOrderWithStatusReady){
        throw new ApiError(401, "Something went wrong while fetching the orders with the status 'Ready'")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, existedOrderWithStatusReady, "Orders with a status of Ready were successfully fetched"))
})

const assignDeliveryRider = asyncHandler(async (req, res) => {
    const {order_id} = req.body

    const updatedOrder = await FoodOrder.findByIdAndUpdate(
        order_id,
        {
            assigned_driver_id: req.rider._id
        },
        {new: true}
    )
    
    if(!updatedOrder){
        throw new ApiError(401, "An error occured while updating the driver ID")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, updatedOrder, "Driver is successfully assigned"))

})

const changeOrderStatus = asyncHandler(async (req, res) => {
    const {order_id, order_status_id} = req.body

    const updatedOrderStatus = await FoodOrder.findByIdAndUpdate(
        order_id,
        {
            order_status_id
        },
        {new: true}
    )

    if(!updatedOrderStatus){
        throw new ApiError(401, "An error occured while updating the order status")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, updatedOrderStatus, "Order status updated successfully"))
})


export {
    registerRider,
    loginRider,
    logoutRider,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentRider,
    updateAccountDetails,
    getAllOrdersWithStatusReady,
    assignDeliveryRider,
    changeOrderStatus
}