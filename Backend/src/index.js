import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth_route.js";
import messageRoutes from "./routes/message_route.js";
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
    })
);

app.use("/api/health", (req, res) => {
    res.status(200).send("API is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

server.listen(PORT, () => {
    connectDB();
});
