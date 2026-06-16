import { MenuItem } from "../models/menu_item.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addMenuItem = asyncHandler(async (req, res) => {
    const {restaurant_id, item_name, price} = req.body

    const existing = await MenuItem.find({restaurant_id, item_name})    

    if(existing.length){
        throw new ApiError(401, "Menu item already exists")
    }

    const createdMenuItem = await MenuItem.create({
        restaurant_id,
        item_name,
        price
    })

    if(!createdMenuItem){
        throw new ApiError(401, "An error occured while creating the menu item")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, createdMenuItem, "Menu item created successfully"))
})

const updateMenuItem = asyncHandler(async (req, res) => {
    const {restaurant_id, item_name, price} = req.body

    const existingMenuItem = await MenuItem.findOne({restaurant_id, item_name})
    
    if(!existingMenuItem){
        throw ApiError(401, "Item does not exist")
    }
    
    existingMenuItem.price = price
    await existingMenuItem.save()

    const updatedMenuItem = await MenuItem.find({restaurant_id, item_name})

    return res
    .status(201)
    .json(new ApiResponse(201, updatedMenuItem, "Menu item updated successfully"))
})

const getAllMenuItems = asyncHandler(async (req, res) => {
    const {restaurant_id} = req.body

    const items = await MenuItem.find({restaurant_id})
    

    if(!items){
        throw new ApiError(401, "An error occured while retrieving all the items")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, items, "Items retrieved successfully"))

})

const deleteMenuItem = asyncHandler(async (req, res) => {
    const {restaurant_id, item_name} = req.body

    await MenuItem.deleteOne({restaurant_id, item_name})

    return res
    .status(201)
    .json(new ApiResponse(201, {}, "Menu Item deleted successfully"))
})

export {
    addMenuItem,
    updateMenuItem,
    getAllMenuItems,
    deleteMenuItem
}