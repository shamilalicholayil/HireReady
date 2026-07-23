const express = require("express");
const router = express.Router();

const { protect } = require("../../middlewares/auth.middleware");

const {
  sendFriendRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  searchUsers,
  getIncomingRequests,
  getOutgoingRequests,
  getFriends,
  blockUser,
  unblockUser,
} = require("../../controllers/friendRequestController");

router.use(protect);

router.get("/search", searchUsers);
router.get("/incoming", getIncomingRequests);
router.get("/outgoing", getOutgoingRequests);
router.get("/friends", getFriends);
router.post("/", sendFriendRequest);
router.patch("/:requestId/accept", acceptRequest);
router.patch("/:requestId/reject", rejectRequest);
router.patch("/:requestId/cancel", cancelRequest);
router.post("/block/:userId", blockUser);
router.delete("/block/:userId", unblockUser);

module.exports = router;
