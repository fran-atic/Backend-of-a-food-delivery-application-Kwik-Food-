import mongoose from "mongoose";
// import { Country } from "./country.models.js";

const addressSchema = new mongoose.Schema({
    unit_number: {
        type: Number,
        required: true,
        trim: true
    },
    street_number: {
        type: Number,
        required: true,
        trim: true
    },
    address_line1: {
        type: String,
        required: true,
        trim: true
    },
    address_line2: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    region: {
        type: String,
        required: true,
        trim: true
    },
    postal_code: {
        type: Number,
        required: true,
        trim: true
    },
    country_id: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Country",
       required: true
    },

}, {timestamps: true})

export const Address = mongoose.model("Address", addressSchema)