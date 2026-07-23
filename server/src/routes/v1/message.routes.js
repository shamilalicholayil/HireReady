const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/multer.attachment.middleware");
const requireFriendship = require("../../middlewares/requireFriendship.middleware");
const {
  getConversationsList,
  getConversation,
  sendMessage,
  markAsRead,
  uploadAttachment,
} = require("../../controllers/messageController");

router.use(protect);

router.get("/", getConversationsList);
router.get(
  "/:userId",
  requireFriendship((req) => req.params.userId),
  getConversation,
);
router.post(
  "/",
  requireFriendship((req) => req.body.receiverId),
  sendMessage,
);
router.patch(
  "/:userId/read",
  requireFriendship((req) => req.params.userId),
  markAsRead,
);
router.post(
  "/attachments",
  upload.single("file"),
  requireFriendship((req) => req.body.receiverId),
  uploadAttachment,
);

module.exports = router;
