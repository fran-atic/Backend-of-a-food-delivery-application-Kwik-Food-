import mongoose from "mongoose";

const orderMenuItemSchema = new mongoose.Schema({
   order_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodOrder"
   },
   menu_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem"
   },
   qty_ordered: {
    type: Number,
    default: 1, 
    trim: true,
    required: true,
   }
}, {timestamps: true})

export const OrderMenuItem = mongoose.model("OrderMenuItem", orderMenuItemSchema)