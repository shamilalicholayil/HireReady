const Joi = require("joi");

const updateInterviewStatusSchema = Joi.object({
  status: Joi.string().valid("in_progress", "completed", "no_show").required(),
});

module.exports = { updateInterviewStatusSchema };
