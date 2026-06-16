import jwt from "jsonwebtoken"
import { Address } from "../models/address.models.js";
import { Restaurant } from "../models/restaurant.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { FoodOrder } from "../models/food_order.models.js";

const generateAccessAndRefreshTokens = async(restaurantId) => {
   try {
      const restaurant = await Restaurant.findById(restaurantId);
      const accessToken = restaurant.generateAccessToken()
      const refreshToken = restaurant.generateRefreshToken()
      
      restaurant.refreshToken = refreshToken
      await restaurant.save({validateBeforeSave: false})

      return {accessToken, refreshToken}

   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
   }
}

const registerRestaurant = asyncHandler( async (req, res) => {

   const {email, username, password, restaurant_name, unit_number, street_number, address_line1, address_line2, city, region, postal_code, country_id} = req.body

   if(
    [email, username, password, restaurant_name, unit_number, street_number, address_line1, address_line2, city, region, postal_code, country_id].some((field) => field?.trim() === "")
   ){
    throw new ApiError(400, "All fields are required")
   }

   const address = await Address.create({
       unit_number,
       street_number,
       address_line1,
       address_line2,
       city,
       region,
       postal_code,
       country_id
      })

      if(!address){
          throw new ApiError(500, "Something went wrong while storing the address")
        }

      const returnedRestaurant = await Restaurant.create({
        email: email,
        username: username,
        password: password,
        restaurant_name: restaurant_name,
        address_id: address._id
      })

      if(!returnedRestaurant){
          throw new ApiError(500, "Something went wrong while registering the restaurant")
        }

      return res
      .status(201)
      .json(new ApiResponse(200, returnedRestaurant, "Restaurant address successfully stored"))
})

const loginRestaurant = asyncHandler ( async (req, res) => {
   const {username, email, password} = req.body;

   if(!username && !email){
        throw new ApiError(400, "username or password is required")
    }

  const restaurant = await Restaurant.findOne({
     $or: [{username}, {email}]
  })

  if(!restaurant){
    throw new ApiError(404, "Restaurant does not exist")
  }

  const isPasswordValid = await restaurant.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401, "Invalid user credentials")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(restaurant._id);

  const loggedInRestaurant = await Restaurant.findById(restaurant._id).select("-password -refreshToken");

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
            restaurant: loggedInRestaurant, accessToken, refreshToken
         },
         "Restaurant logged In Successfully"
      )
    )
})

const logoutRestaurant = asyncHandler (async (req, res) => {
  await Restaurant.findByIdAndUpdate(
        req.restaurant._id,
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
  .json(new ApiResponse(200, {}, "User logged Out"))
})

const updateCurrentPassword = asyncHandler (async (req, res) => {
     const {oldPassword, newPassword} = req.body
     
     const restaurant = await Restaurant.findById(req.restaurant?._id)
  
     const isPasswordCorrect = await restaurant.isPasswordCorrect(oldPassword)
  
     if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
     }
  
     restaurant.password = newPassword
     await restaurant.save({validateBeforeSave: false})
  
     return res
     .status(200)
     .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const updateRestaurantDetails = asyncHandler (async (req, res) => {
     const {restaurant_name, username, email} = req.body;
  
     if(!restaurant_name || !username || !email){
        throw new ApiError(400, "All fields are required")
     }
  
     const restaurant = await Restaurant.findByIdAndUpdate(
        req.restaurant?._id,
        {
           $set: {
              restaurant_name,
              username,
              email
           }
        },
        {new :true}
     ).select("-password -refreshToken")
  
     return res
     .status(200)
     .json(new ApiResponse(200, restaurant, "Restaurant details updated successfully"))
})

const refreshRestaurantRefreshToken = asyncHandler (async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
     if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
     }
  
     try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
     
        const restaurant = await Restaurant.findById(decodedToken?._id)
     
        if(!restaurant){
           throw new ApiError(401, "Invalid refresh token")
        }
        
        if(incomingRefreshToken !== restaurant?.refreshToken){
           throw new ApiError(401, "Refresh token is expired or used")
        }
     
        const options = {
           httpOnly: true,
           secure: true
        }
     
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(restaurant._id)
     
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
           new ApiResponse(
              200,
              {accessToken, refreshToken: newRefreshToken},
              "Access token refreshed"
           )
        )
     } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
     }
})

const getCurrentRestaurant = asyncHandler (async (req, res) => {
  res
  .status(200)
  .json(new ApiResponse(200, req.restaurant, "Current restaurant fetched successfully"))
})

const getRestaurantAddress = asyncHandler( async (req, res) => {
  const {restaurantId} = req.body;
  const address = await Restaurant.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(restaurantId)
      }
    },
    {
      $lookup: {
        from: "addresses",
        localField: "address_id",
        foreignField: "_id",
        as: "restaurantAddress"
      }
    }
  ])

  if(!address){
    throw new ApiError(404, "Address does not exists")
  }

  return res
  .status(201)
  .json(new ApiResponse(201, address[0].restaurantAddress, "Address successfully fetched"))
})

const updateRestaurantAddress = asyncHandler (async (req, res) => {
   const {unit_number, street_number, address_line1, address_line2, city, region, postal_code, country_id} = req.body;
  
     if(!unit_number || !street_number || !address_line1 || !address_line2 || !city || !region || !postal_code || !country_id){
        throw new ApiError(400, "All fields are required")
     }
  
     const address = await Address.findByIdAndUpdate(
        req.restaurant.address_id,
        {
           $set: {
              unit_number,
              street_number,
              address_line1,
              address_line2,
              city, 
              region,
              postal_code,
              country_id, 
           }
        },
        {new :true}
     )
  
     return res
     .status(200)
     .json(new ApiResponse(200, address, "Address updated successfully"))
})

const deleteRestaurantAddress = asyncHandler (async (req, res) => {
  const {addressId} = req.body
  await Address.findByIdAndDelete(addressId);
  
   return res
  .status(200)
  .json(new ApiResponse(200, null, "Address deleted successfully"))
})

const changeOrderStatus = asyncHandler(async (req, res) => {
    const {order_id, order_status_id} = req.body

    const updatedOrderStatus = await FoodOrder.findByIdAndUpdate(
        order_id,
        {
            order_status_id: order_status_id
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
  registerRestaurant,
  loginRestaurant,
  logoutRestaurant,
  getRestaurantAddress,
  updateRestaurantAddress,
  deleteRestaurantAddress,
  updateCurrentPassword,
  updateRestaurantDetails,
  refreshRestaurantRefreshToken,
  getCurrentRestaurant,
  changeOrderStatus
}