import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  getFriendsState,
  removeFriend,
  requestFriend,
} from "../controllers/friendsController.js";

const router = Router();

router.get("/state", requireAuth, getFriendsState);
router.post("/request", requireAuth, requestFriend);
router.post("/accept", requireAuth, acceptFriendRequest);
router.post("/decline", requireAuth, declineFriendRequest);
router.post("/cancel", requireAuth, cancelFriendRequest);
router.post("/remove", requireAuth, removeFriend);

export default router;

