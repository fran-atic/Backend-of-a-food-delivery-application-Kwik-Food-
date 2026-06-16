import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const riderSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
  },  
  lastName: {
    type: String,
    trim: true,
    required: true,
  },  
  username: {
    type: String,
    trim: true,
    required: true,
  },  
  password: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
  },
  refreshToken: {
    type: String,
    trim: true,
  }  
}, {timestamps: true})

riderSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

riderSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

riderSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

riderSchema.methods.generateRefreshToken = function(){
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

export const Rider = mongoose.model("Rider", riderSchema)