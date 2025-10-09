import express from 'express';
import protectRoute from '../middleware/auth_middleware.js';
import { getUsersForSidebar, getMessages, sendMessage } from '../controllers/message_controller.js';

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:msgToId", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);


export default router;
