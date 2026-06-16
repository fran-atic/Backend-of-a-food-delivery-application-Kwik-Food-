import jwt from "jsonwebtoken"
import { Restaurant } from "../models/restaurant.models.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const verifyJWTRestaurant = asyncHandler( async (req, _, next) => {
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
 
     if(!token){
         throw new ApiError(401, "Unauthorized request")
     }
 
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
     const restaurant = await Restaurant.findById(decodedToken?._id).select("-password -refreshToken")
 
     if(!restaurant){
        
         throw new ApiError(401, "Invalid Access Token")
     }
 
     req.restaurant = restaurant;
     next()
   } catch (error) {
      throw new ApiError(401, error?.message || "Invaild access token")
   }
}) 