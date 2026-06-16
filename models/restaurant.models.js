import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const restaurantSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    refreshToken: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    restaurant_name: {
        type: String,
        required: true,
        trim: true
    },
    address_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    }
}, {timestamps: true})

restaurantSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

restaurantSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

restaurantSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            restaurant_name: this.restaurant_name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

restaurantSchema.methods.generateRefreshToken = function(){
        return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const Restaurant = mongoose.model("Restaurant", restaurantSchema)