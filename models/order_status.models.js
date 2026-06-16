import mongoose from "mongoose";

const orderStatusSchema = new mongoose.Schema({
    status_value: {
        type: String,
        enum: ['Pending', 'Cancelled', 'Preparing', 'Ready', 'Out_for_Delivery', 'Delivered'],
        required: true,
        unique: true,
        trim: true
    }
}, {timestamps: true})

export const OrderStatus = mongoose.model("OrderStatus", orderStatusSchema)