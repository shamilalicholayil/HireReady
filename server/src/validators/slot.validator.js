const Joi = require("joi");

const createSlotSchema = Joi.object({
  name: Joi.string().required(),
  track: Joi.string()
    .valid("frontend", "backend", "dsa", "fullstack")
    .required(),
  job: Joi.string().hex().length(24),
  date: Joi.date().required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().greater(Joi.ref("startTime")).required(),
});

const updateInterviewStatusSchema = Joi.object({
  status: Joi.string().valid("in_progress", "completed", "no_show").required(),
});

const setSlotOutcomeSchema = Joi.object({
  outcome: Joi.string().valid("shortlisted", "rejected").required(),
});

const scheduleNextRoundSchema = Joi.object({
  nextSlotId: Joi.string().hex().length(24).required(),
  round: Joi.string().valid("technical", "managerial", "hr_final").required(),
});

module.exports = {
  createSlotSchema,
  updateInterviewStatusSchema,
  setSlotOutcomeSchema,
  scheduleNextRoundSchema,
};
