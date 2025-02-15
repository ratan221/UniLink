import express from "express";
import dotenv from "dotenv";

import authRoutes  from "./routes/auth.route.js";

import { connectDB } from "./lib/db.js";


dotenv.config();

const app = express();
const port = process.env.port || 5000;


app.use("/appo/v1/auth", authRoutes)

app.listen(port, () =>
{
    console.log(`Server running on port ${port}`);
    connectDB();
})
