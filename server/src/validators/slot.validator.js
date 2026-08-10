const Joi = require("joi");

const updateInterviewStatusSchema = Joi.object({
  status: Joi.string().valid("in_progress", "completed", "no_show").required(),
});

const setSlotOutcomeSchema = Joi.object({
  outcome: Joi.string().valid("shortlisted", "rejected").required(),
});

const scheduleNextRoundSchema = Joi.object({
  startTime: Joi.date().required(),
  endTime: Joi.date().greater(Joi.ref("startTime")).required(),
});

module.exports = {
  updateInterviewStatusSchema,
  setSlotOutcomeSchema,
  scheduleNextRoundSchema,
};
