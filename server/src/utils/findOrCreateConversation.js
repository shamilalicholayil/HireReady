const Conversation = require("../models/Conversation");

const findOrCreateConversation = async (
  userA,
  userB,
  { create = true } = {},
) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [userA, userB], $size: 2 },
  });

  if (!conversation && create) {
    conversation = await Conversation.create({ participants: [userA, userB] });
  }

  return conversation;
};

module.exports = findOrCreateConversation;
