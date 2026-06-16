import { OrderMenuItem } from "../models/order_menu_item.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addItemToOrder = asyncHandler( async (req, res) => {
   const {order_id, menu_item_id, qty_ordered} = req.body

   const existingOrder = await OrderMenuItem.findOne({order_id, menu_item_id})

   if(existingOrder){
     existingOrder.qty_ordered += qty_ordered;
     await existingOrder.save()
     return res
     .status(201)
     .json(new ApiResponse(201, existingOrder, "Order updated successfully"))
   }

   const item = await OrderMenuItem.create({
    order_id,
    menu_item_id,
    qty_ordered
   })

   if(!item){
    throw new ApiError(401, "An error occured while storing order menu item")
   }
   

    return res
   .status(201)
   .json(new ApiResponse(201, item, "Order menu item created successfully"))
})

const updateItemOrder = asyncHandler( async (req, res) => {
    const {order_menu_id, qty_ordered} = req.body;

    const item = await OrderMenuItem.findByIdAndUpdate(
        order_menu_id,
        {
            qty_ordered
        },
        {new: true}
    )

    if(!item){
        throw new ApiError(401, "Something went wrong while updating the quantity ordered in order menu item")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, item, "Quantity updated successfully"))
})

const removeItemFromOrder = asyncHandler ( async (req, res) => {
    const {order_menu_id} = req.body

    const deletedItem = await OrderMenuItem.findByIdAndDelete(order_menu_id)

    if (!deletedItem) {
    throw new ApiError(404, "Order menu item not found or already deleted");
}

    return res
    .status(201)
    .json(new ApiResponse(201, {}, "Item order deleted successfully"))
})

const getAllItemsForOrder = asyncHandler ( async (req, res) => {
    const {order_id} = req.body

    const items = await OrderMenuItem.find({order_id})

    if(!items){
        throw new ApiError(401, "An error occured while fetching the order items")
    }

    return res
   .status(201)
   .json(new ApiResponse(201, items, "Order items fetched successfully"))
})

const clearAllItemsFromOrder = asyncHandler (async (req, res) => {
    const {order_id} = req.body
    
    await OrderMenuItem.deleteMany({order_id})

    return res
    .status(201)
    .json(new ApiResponse(201, {}, "All the items from the order were deleted successfully"))
})

export {
    addItemToOrder,
    updateItemOrder,
    removeItemFromOrder,
    getAllItemsForOrder,
    clearAllItemsFromOrder
}