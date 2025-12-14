import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth_route.js";
import messageRoutes from "./routes/message_route.js";
import friendRoutes from "./routes/friend_route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();
const FrontURL = process.env.FRONTENDURL;

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: FrontURL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);


app.get("/api/health", (_req, res) => {
    res.status(200).send("API is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendRoutes);


    const isProduction = process.env.NODE_ENV === "production";

    if(isProduction)
    {
        console.log("Production!!!");
    }
    else
    {
        console.log("Development!!!");
    }

server.listen(PORT, () => {
    connectDB();
});
