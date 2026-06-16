import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import
import customerRouter from './routes/customer.routes.js'
import customerAddressRouter from './routes/addressCustomer.routes.js'
import restaurantRouter from './routes/restaurant.routes.js'
import riderRouter from './routes/rider.routes.js'
import foodOrderRouter from './routes/foodOrder.routes.js'
import orderStatusRouter from './routes/orderStatus.routes.js'
import orderMenuItemRouter from './routes/orderMenuItem.routes.js'
import menuItemRouter from './routes/menuItem.routes.js'


//routes declaration
app.use("/api/v1/customer", customerRouter)  // done
app.use("/api/v1/customer", customerAddressRouter)  // done
app.use("/api/v1/restaurant", restaurantRouter) // done
app.use("/api/v1/rider", riderRouter) // done
app.use("/api/v1/customer", foodOrderRouter)
app.use("/api/v1/orderStatus", orderStatusRouter) // done
app.use("/api/v1/customer", orderMenuItemRouter)
app.use("/api/v1/restaurant", menuItemRouter)    // done


export { app }