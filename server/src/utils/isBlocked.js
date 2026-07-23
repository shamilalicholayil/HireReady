const User = require("../models/User");

const isBlocked = async (userA, userB) => {
  const user = await User.findById(userA).select("blockedUsers");
  return user.blockedUsers.some((id) => id.equals(userB));
};

module.exports = isBlocked;
