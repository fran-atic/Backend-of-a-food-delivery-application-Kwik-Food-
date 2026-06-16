import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
   restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant"
   },
   item_name: {
    type: String,
    required: true,
    trim: true
   },
   price: {
    type: Number,
    required: true
   }
}, {timestamps: true})

export const MenuItem = mongoose.model("MenuItem", menuItemSchema)