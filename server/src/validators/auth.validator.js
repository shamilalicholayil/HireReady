const Joi = require("joi");

const passwordRule = Joi.string()
  .min(8)
  .max(64)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
    "string.min": "Password must be at least 8 characters.",
  });

const otpRule = Joi.number().integer().min(100000).max(999999).required();

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: passwordRule,
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: otpRule,
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  newPassword: passwordRule,
});

const registerHRSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: passwordRule,
  companyName: Joi.string().min(2).max(100).required(),
});

const verifyOtpHRSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: otpRule,
});

module.exports = {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  registerHRSchema,
  verifyOtpHRSchema,
};
