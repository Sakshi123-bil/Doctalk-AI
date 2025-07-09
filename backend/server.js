const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config({path:"./.env"})
const connectToDB = require("./config/db");
const app = express();

app.use(express.json());
app.use(cors());
connectToDB();
app.listen(4000,()=>{
    console.log("server is running on port 4000")
})