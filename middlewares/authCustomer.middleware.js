import { Customer } from "../models/customer.models.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"

export const verifyJWTCustomer = asyncHandler( async (req, _, next) => {
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
 
     if(!token){
         throw new ApiError(401, "Unauthorized request")
     }
 
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
     const customer = await Customer.findById(decodedToken?._id).select("-password -refreshToken")
 
     if(!customer){
         // discussion
         throw new ApiError(401, "Invalid Access Token")
     }
 
     req.customer = customer;
     next()
   } catch (error) {
      throw new ApiError(401, error?.message || "Invaild access token")
   }
}) 