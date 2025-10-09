import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth_route.js';
import messageRoutes from './routes/message_route.js';
import { connectDB } from './lib/db.js';
import {app, server} from "./lib/socket.js";

dotenv.config();

const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/api/health", (req, res) => {
    res.status(200).send("API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});
