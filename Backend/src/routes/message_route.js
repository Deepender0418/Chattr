import express from 'express';
import protectRoute from '../middleware/auth_middleware.js';
import { getFriends, getMessages, sendMessage } from '../controllers/message_controller.js';

const router = express.Router();

router.get("/users", protectRoute, getFriends);
router.get("/:msgToId", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;