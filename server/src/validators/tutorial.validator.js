const Joi = require("joi");

const createTutorialSchema = Joi.object({
  title: Joi.string().required(),
  youtubeId: Joi.string().required(),
  track: Joi.string()
    .valid("frontend", "backend", "dsa", "fullstack")
    .required(),
  description: Joi.string().optional(),
  difficulty: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .required(),
  topics: Joi.array().items(Joi.string()).optional(),
});

const updateTutorialSchema = Joi.object({
  title: Joi.string().optional(),
  youtubeId: Joi.string().optional(),
  track: Joi.string()
    .valid("frontend", "backend", "dsa", "fullstack")
    .optional(),
  description: Joi.string().optional(),
  difficulty: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .optional(),
  topics: Joi.array().items(Joi.string()).optional(),
});

module.exports = { createTutorialSchema, updateTutorialSchema };
