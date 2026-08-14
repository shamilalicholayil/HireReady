const Joi = require("joi");

const { TRACK_STACK_MAP } = require("../constants/trackStack");

const validStacksForTrack = (value, helpers) => {
  const { track } = helpers.state.ancestors[0];
  if (!TRACK_STACK_MAP[track]?.includes(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const createQuestionSchema = Joi.object({
  question: Joi.string().required(),
  track: Joi.string()
    .valid(...Object.keys(TRACK_STACK_MAP))
    .required(),
  stack: Joi.string().when("track", {
    is: "dsa",
    then: Joi.forbidden(),
    otherwise: Joi.string().custom(validStacksForTrack).required(),
  }),
  difficulty: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .required(),
  topics: Joi.array().items(Joi.string()).optional(),
  answerKeyPoints: Joi.array().items(Joi.string()).optional(),
});

const updateQuestionSchema = Joi.object({
  question: Joi.string().optional(),
  track: Joi.string()
    .valid(...Object.keys(TRACK_STACK_MAP))
    .optional(),
  stack: Joi.string().when("track", {
    is: "dsa",
    then: Joi.forbidden(),
    otherwise: Joi.string().custom(validStacksForTrack),
  }),
  difficulty: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .optional(),
  topics: Joi.array().items(Joi.string()).optional(),
  answerKeyPoints: Joi.array().items(Joi.string()).optional(),
}).with("stack", "track");

module.exports = { createQuestionSchema, updateQuestionSchema };
