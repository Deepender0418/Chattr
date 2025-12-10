import express from "express";
import { protectRoute } from "../middleware/auth_middleware.js";
import { getFriendRequests, getFriends, respondFriendRequest, searchUser, sendFriendRequest, removeFriend } from "../controllers/friend_controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUser);
router.post("/request", protectRoute, sendFriendRequest);
router.get("/requests", protectRoute, getFriendRequests);
router.post("/respond", protectRoute, respondFriendRequest);
router.get("/list", protectRoute, getFriends);
router.delete("/:id", protectRoute, removeFriend);

export default router;

