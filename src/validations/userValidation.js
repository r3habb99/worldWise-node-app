const Joi = require("joi");

const registerValidation = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required.",
  }),
  age: Joi.number().integer().min(18).max(120).required().messages({
    "number.base": "Age must be a number.",
    "number.integer": "Age must be an integer.",
    "number.min": "Age must be at least 18.",
    "number.max": "Age cannot exceed 120.",
    "any.required": "Age is required.",
  }),
  gender: Joi.string().valid("male", "female", "other").required().messages({
    "any.only": 'Gender must be "male", "female", or "other".',
    "any.required": "Gender is required.",
  }),
  phone: Joi.string()
    .pattern(/^\d{3}-\d{3}-\d{4}$/)
    .required()
    .messages({
      "string.pattern.base": 'Phone must be in the format "123-456-7890".',
      "any.required": "Phone is required.",
    }),
});

const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().required().min(8).max(15).messages({
    "string.empty": "Password must not be empty.",
    "string.min": "Password must be at least 8 characters long.",
    "string.max": "Password must not exceed 15 characters.",
    "any.required": "Password is required.",
    "any.invalid": "Invalid Credentials",
  }),
});

module.exports = { registerValidation, loginValidation };
