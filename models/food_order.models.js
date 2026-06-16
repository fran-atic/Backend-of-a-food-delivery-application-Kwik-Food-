import mongoose from "mongoose";

const foodOrderSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    restaurant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    customer_address_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true
    },
    order_status_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderStatus",
        required: true
    },
    assigned_driver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rider"
    },
    order_dateTime: {
        type: String,
        trim: true
    },
    delivery_fee: {
        type: Number,
        trim: true
    },
    total_amount: {
        type: Number,
        trim: true
    },
    final_amount: {
        type: Number,
        trim: true
    },
    requested_delivery_dateTime: {
        type: String,
        trim: true
    },
    cust_driver_rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5]
    },
    cust_restaurant_rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5]
    }
}, {timestamps: true})

export const FoodOrder = mongoose.model("FoodOrder", foodOrderSchema)