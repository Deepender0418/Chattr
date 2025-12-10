import User from "../models/user_model.js";
import Message from "../models/message_model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const me = await User.findById(loggedInUserId).select("friends");

        if (!me) {
            return res.status(404).json({ error: "User not found" });
        }

        const friends = await User.find({ _id: { $in: me.friends || [] } }).select("-password");

        res.status(200).json(friends);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
        const cursor = req.query.cursor ? new Date(req.query.cursor) : new Date();

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
            createdAt: { $lt: cursor },
        })
            .sort({ createdAt: -1 })
            .limit(limit + 1);

        const hasMore = messages.length > limit;
        const sliced = hasMore ? messages.slice(0, limit) : messages;
        const nextCursor = hasMore ? sliced[sliced.length - 1].createdAt : null;

        const unseenMessages = sliced.filter(
            (msg) => msg.receiverId.toString() === myId.toString() && !msg.seen
        );

        if (unseenMessages.length) {
            const unseenIds = unseenMessages.map((m) => m._id);
            await Message.updateMany(
                { _id: { $in: unseenIds } },
                { seen: true, seenAt: new Date() }
            );

            const receiverSocketId = getReceiverSocketId(userToChatId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("messagesSeen", {
                    messageIds: unseenIds,
                    userId: myId,
                });
            }

            sliced.forEach((m) => {
                if (unseenIds.includes(m._id)) {
                    m.seen = true;
                    m.seenAt = new Date();
                }
            });
        }

        res.status(200).json({
            messages: sliced.reverse(),
            hasMore,
            nextCursor,
        });
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, media } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let mediaUrl;
        if(media){
            const uploadResponse = await cloudinary.uploader.upload(media, {
            folder: 'chattr/media',
                resource_type: 'auto'
            });
            mediaUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            media: mediaUrl,
            seen: false,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const markMessagesAsSeen = async (req, res) => {
    try {
        const { id: senderId } = req.params;
        const receiverId = req.user._id;

        const unseenMessages = await Message.find({
            senderId,
            receiverId,
            seen: false,
        }).select("_id");

        if (!unseenMessages.length) {
            return res.status(200).json({ success: true, messageIds: [] });
        }

        const messageIds = unseenMessages.map((m) => m._id);

        await Message.updateMany(
            { _id: { $in: messageIds } },
            { seen: true, seenAt: new Date() }
        );

        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesSeen", {
                messageIds,
                userId: receiverId,
            });
        }

        res.status(200).json({ success: true, messageIds });
    } catch (error) {
        console.log("Error in markMessagesAsSeen controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
