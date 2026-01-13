import User from "../models/user_model.js";
import Message from "../models/message_model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select("friends");

    if (!me) {
      return res.status(404).json({ error: "User not found" });
    }

    const friends = await User.find({
      _id: { $in: me.friends || [] },
    }).select("-password");

    res.status(200).json(friends);
  } catch (error) {
    console.error("getUsersForSidebar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const cursor = req.query.cursor ? JSON.parse(req.query.cursor) : null;

    const query = {
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    };

    if (cursor) {
      query.$and = [
        {
          $or: [
            { createdAt: { $lt: new Date(cursor.createdAt) } },
            {
              createdAt: new Date(cursor.createdAt),
              _id: { $lt: cursor._id },
            },
          ],
        },
      ];
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    const sliced = hasMore ? messages.slice(0, limit) : messages;

    const nextCursor = hasMore
      ? {
          createdAt: sliced[sliced.length - 1].createdAt,
          _id: sliced[sliced.length - 1]._id,
        }
      : null;

    res.status(200).json({
      messages: sliced.reverse(),
      hasMore,
      nextCursor,
    });
  } catch (error) {
    console.error("getMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, media } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !media) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    let mediaUrl = null;

    if (media) {
      const upload = await cloudinary.uploader.upload(media, {
        folder: "chattr/media",
        resource_type: "auto",
      });
      mediaUrl = upload.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      media: mediaUrl,
      seen: false,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage.toObject());
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage:", error);
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
    console.error("markMessagesAsSeen:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
