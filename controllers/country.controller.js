import { Country } from "../models/country.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addCountry = asyncHandler( async (req, res) => {
    const {country_name} = req.body
    console.log(country_name);
    
    if(country_name === ""){
        throw new ApiError(400, "All fields are required")
    }

    const existedCountry = await Country.findOne({country_name});

    if(existedCountry){
        return res
        .status(201)
        .json(new ApiResponse(200, existedCountry._id, "Country code returned successfully"))
    }

    const createdCountry = await Country.create({
        country_name
    })

    if(!createdCountry){
        throw new ApiError(409, "Something went wrong while creating country code")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, createdCountry._id, "Country code successfully created"))
})

export{
    addCountry
}
