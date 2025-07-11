const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config({path:"./.env"})
const connectToDB = require("./config/db");
const app = express();
const authRoutes = require("./Routes/authRoute")
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use(cors());
connectToDB();
app.listen(process.env.PORT || 8000,()=>{
    console.log(`server is running on ${process.env.PORT}`)
})