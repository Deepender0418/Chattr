import { getRecieverSocketId, io } from "../lib/socket.js";

export const getFriends = async (req, res) => {
    try {
        const loggedinUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedinUserId}}).select('-password');
        res.status(200).json(filteredUsers);
    }
    catch (error) {
        console.log("error in getFriends-message_controller.js =", error.message);
        res.status(500).send("Server error");
    }
}

export const getMessages = async (req, res) => {
    try{
        const {msgToId} = req.params;
        const senderId = req.user._id;
        const messages = await Message.find({
            $or:[{senderId: senderId, receiverId: msgToId}, 
                 {senderId: msgToId, receiverId: senderId}
                ]
        });
        res.status(200).json(messages);
    }
    catch (error) {
        console.log("error in getMessages-message_controller.js =", error.message);
        res.status(500).send("Server error");
    }
}

export const sendMessage = async (req, res) => {
    try{
        const {text, media} = req.body;
        const senderId = req.user._id;
        const {id: receiverId} = req.params;

        let mediaUrl;
        if(media){
            // Upload media to cloudinary
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
            media: mediaUrl
        });

        await newMessage.save();
        const recieverSocketId = getRecieverSocketId(receiverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    }
    catch (error) {
        console.log("error in sendMessage-message_controller.js =", error.message);
        res.status(500).send("Server error");
    }
};