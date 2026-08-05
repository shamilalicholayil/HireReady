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

module.exports = { createSlotSchema, updateInterviewStatusSchema };
