const Joi = require("joi");

const createJobSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  company: Joi.string().required(),
  location: Joi.string().required(),
  track: Joi.string()
    .valid("frontend", "backend", "dsa", "fullstack")
    .required(),
  salaryRange: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(Joi.ref("min")),
  }),
});

const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid("shortlisted", "rejected").required(),
});

const scheduleApplicantInterviewSchema = Joi.object({
  startTime: Joi.date().required(),
  endTime: Joi.date().greater(Joi.ref("startTime")).required(),
});

module.exports = {
  createJobSchema,
  updateApplicationStatusSchema,
  scheduleApplicantInterviewSchema,
};
