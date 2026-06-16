import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {Customer} from "../models/customer.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(customerId) => {
   try {
      const customer = await Customer.findById(customerId);
      const accessToken = customer.generateAccessToken()
      const refreshToken = customer.generateRefreshToken()
      
      customer.refreshToken = refreshToken
      await customer.save({validateBeforeSave: false})

      return {accessToken, refreshToken}

   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
   }
}

const registerCustomer = asyncHandler( async (req, res) => {
   
   // get user details from frontend
   // validation - not empty
   // check if user already exists: username, email
   // check for images, check for avatar
   // upload them to cloudinary, avatar
   // create user object - create entry in db
   // remove password and refresh token field from response
   // check for user creation
   // return response

   const {firstName, lastName, email, username, password} = req.body
   console.log("email: ", email);

   if(
    [firstName, lastName, email, username, password].some((field) => field?.trim() === "")
   ){
    throw new ApiError(400, "All fields are required")
   }

   const existedUser = await Customer.findOne({
    $or: [{ username }, { email }]
   })

   if(existedUser){
    throw new ApiError(409, "User with email or username already exists")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   
   if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if(!avatar){
    throw new ApiError(400, "Avatar file is required");
   }

   const customer = await Customer.create({
    firstName,
    lastName,
    avatar: avatar.url,
    email,
    password,
    username: username.toLowerCase()
   })

   const createdCustomer = await Customer.findById(customer._id).select(
    "-password -refreshToken"
   )

   if(!createdCustomer){
    throw new ApiError(500, "Something went wrong while registering the user");
   }

   return res.status(201).json(
    new ApiResponse(200, createdCustomer, "User registered successfully")
   )

})

const loginCustomer = asyncHandler( async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookies

    const {email, username, password} = req.body

    if(!username && !email){
      throw new ApiError(400, "username or password is required")
    }

    const customer = await Customer.findOne({
      $or: [{username}, {email}]
    })

    if(!customer){
      throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await customer.isPasswordCorrect(password)
    
    if(!isPasswordValid){
      throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(customer._id);

    const loggedInCustomer = await Customer.findById(customer._id).select("-password -refreshToken");

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
            customer: loggedInCustomer, accessToken, refreshToken
         },
         "Customer logged In Successfully"
      )
    )

})

const logoutCustomer = asyncHandler( async (req, res) => {
   await Customer.findByIdAndUpdate(
      req.customer._id,
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
  .json(new ApiResponse(200, {}, "Customer logged Out"))
})

const refreshAccessToken = asyncHandler( async (req, res) => {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
      throw new ApiError(401, "unauthorized request")
   }

   try {
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
   
      const customer = await Customer.findById(decodedToken?._id)
   
      if(!customer){
         throw new ApiError(401, "Invalid refresh token")
      }
      
      if(incomingRefreshToken !== customer?.refreshToken){
         throw new ApiError(401, "Refresh token is expired or used")
      }
   
      const options = {
         httpOnly: true,
         secure: true
      }
   
      const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(customer._id)
   
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

const changeCurrentPassword = asyncHandler( async (req, res) => {
   const {oldPassword, newPassword} = req.body
   
   const customer = await Customer.findById(req.customer?._id)

   const isPasswordCorrect = await customer.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect){
      throw new ApiError(400, "Invalid old password")
   }

   customer.password = newPassword
   await customer.save({validateBeforeSave: false})

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentCustomer = asyncHandler(async(req, res) => {
   return res
   .status(200)
   .json(new ApiResponse(200, req.customer, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
   const {firstName, lastName, email} = req.body;

   if(!firstName || !lastName || !email){
      throw new ApiError(400, "All fields are required")
   }

   const customer = await Customer.findByIdAndUpdate(
      req.customer?._id,
      {
         $set: {
            firstName,
            lastName,
            email: email
         }
      },
      {new :true}
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(200, customer, "Account details updated successfully"))
})

const updateCustomerAvatar = asyncHandler( async (req, res) => {
   const avatarLocalPath = req.file?.path

   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file is missing")
   }
   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if(!avatar.url){
      throw new ApiError(400, "Error while uploading on cloudinary");
   }

   const customer = await Customer.findByIdAndUpdate(
      req.customer?._id,
      {
         $set:{
            avatar: avatar.url
         }
      },
      {new: true}
   ).select("-password")

   if(!customer){
      throw new ApiError(400, "Error while storing in database")
   }

   return res
   .status(200)
   .json(new ApiResponse(200, customer, "Avatar image updated successfully"))
}) 


export {
   registerCustomer,
   loginCustomer,
   logoutCustomer,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentCustomer,
   updateAccountDetails,
   updateCustomerAvatar
}