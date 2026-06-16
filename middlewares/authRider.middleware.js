import jwt from "jsonwebtoken"
import { Rider } from "../models/rider.models.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const verifyJWTRider = asyncHandler( async (req, _, next) => {
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
 
     if(!token){
         throw new ApiError(401, "Unauthorized request")
     }
 
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
     const rider = await Rider.findById(decodedToken?._id).select("-password -refreshToken")
 
     if(!rider){
         // discussion
         throw new ApiError(401, "Invalid Access Token")
     }
 
     req.rider = rider;
     next()
   } catch (error) {
      throw new ApiError(401, error?.message || "Invaild access token")
   }
}) 