import mongoose from "mongoose";
import { Address } from "../models/address.models.js";
import { CustomerAddress } from "../models/customer_address.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const fillCustomerAddress = asyncHandler( async (req, res) => {
   console.log(req.body);
   
   const {unit_number, street_number, address_line1, address_line2, city, region, postal_code, country_id} = req.body

   if(
    [unit_number, street_number, address_line1, address_line2, city, region, postal_code, country_id].some((field) => field?.trim() === "")
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

      const customerAddress = await CustomerAddress.create({
        customer_id: req.customer._id,
        address_id: address._id
      })

      if(!customerAddress){
          throw new ApiError(500, "Something went wrong while storing the customer address")
        }

      return res
      .status(201)
      .json(new ApiResponse(200, customerAddress, "Customer address successfully stored"))

})

const getCustomerAddress = asyncHandler(async (req, res) => {
  const presentCustomer_id = req.customer._id;
  const address = await CustomerAddress.aggregate([
    {
      $match: {
        customer_id: new mongoose.Types.ObjectId(presentCustomer_id)
      }
    },
    {
      $lookup: {
        from: "addresses",
        localField: "address_id",
        foreignField: "_id",
        as: "customerAddress"
      }
    }
  ])

  if(!address?.length || !address[0]?.customerAddress){
    throw new ApiError(404, "Address does not exists")
  }

  return res
  .status(201)
  .json(new ApiResponse(201, address[0]?.customerAddress, "Address successfully fetched"))
})

const updateCustomerAddress = asyncHandler ( async (req, res) => {
    const {address_id, unit_number, street_number, address_line1, address_line2, city, region, postal_code, country_id} = req.body;
  
     if(!unit_number || !street_number || !address_line1 || !address_line2 || !city || !region || !postal_code || !country_id){
        throw new ApiError(400, "All fields are required")
     }
  
     const address = await Address.findByIdAndUpdate(
        address_id,
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

const deleteCustomerAddress = asyncHandler ( async (req, res) => {
  const {addressId} = req.body
  await Address.findByIdAndDelete(addressId);
  await CustomerAddress.findByIdAndDelete(addressId);
  res
  .status(200)
  .json(new ApiResponse(200, null, "Address deleted successfully"))
})



export {
    fillCustomerAddress,
    getCustomerAddress,
    updateCustomerAddress,
    deleteCustomerAddress
}

