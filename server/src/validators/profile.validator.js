const Joi = require("joi");

const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  bio: Joi.string().max(200).optional(),
  age: Joi.number().min(18).max(100).optional(),
  gender: Joi.string().valid("male", "female").optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  track: Joi.string()
    .valid("frontend", "backend", "dsa", "hr", "fullstack")
    .optional(),
});

module.exports = { updateProfileSchema };
