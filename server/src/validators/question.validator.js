const Joi = require("joi");

const createQuestionSchema = Joi.object({
  question: Joi.string().required(),
  track: Joi.string()
    .valid("frontend", "backend", "dsa", "fullstack")
    .required(),
  difficulty: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .required(),
  topics: Joi.array().items(Joi.string()).optional(),
  answerKeyPoints: Joi.array().items(Joi.string()).optional(),
});

const updateQuestionSchema = Joi.object({
  question: Joi.string().optional(),
  track: Joi.string()
    .valid("frontend", "backend", "dsa", "fullstack")
    .optional(),
  difficulty: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .optional(),
  topics: Joi.array().items(Joi.string()).optional(),
  answerKeyPoints: Joi.array().items(Joi.string()).optional(),
});

module.exports = { createQuestionSchema, updateQuestionSchema };
