import mongoose from "mongoose";
// import { Customer } from "./customer.models.js";
// import { Address } from "./address.models.js";

const customerAddressSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
    },
    address_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    }
}, {timestamps: true})

export const CustomerAddress = mongoose.model("CustomerAddress", customerAddressSchema)