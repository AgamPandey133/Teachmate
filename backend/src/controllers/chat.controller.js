import Message from "../models/Message.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import User from "../models/User.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUser = await User.findById(req.user._id).populate("friends", "-password");

    res.status(200).json(loggedInUser.friends);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audioUrl } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Verify friend relationship via DB
    const sender = await User.findById(senderId).select('friends');
    const isFriend = sender.friends.some((fid) => fid.equals(receiverId));
    if (!isFriend) {
      return res.status(403).json({ error: "You can only message your friends" });
    }

    // TODO: Handle Image Upload if needed
    // For now assuming text only or image URL provided directly

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image,
      audioUrl,
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
