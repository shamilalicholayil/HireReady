const { Router } = require("express");
const router = Router();

const {
  getAllUsers,
  toggleBlockUser,
} = require("../../controllers/userController");

const { protect, isAdmin } = require("../../middlewares/auth.middleware");

router.use(protect);
router.use(isAdmin);

router.get("/", getAllUsers);
router.patch("/:id/toggle-block", toggleBlockUser);

module.exports = router;
