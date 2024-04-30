const { HTTP_STATUS_CODE } = require("../constants/httpConstants");
const { errorResponse } = require("../utils/responses");

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      // Extract error details
      const errorMessage = error.details[0].message;
      const validationErrors = error.details.map((detail) => detail.message);
console.log(">>>>>>>>>>>>>>>", validationErrors);
      // Send error response with validation errors using errorResponse function
      return errorResponse(
        res,
        HTTP_STATUS_CODE.BAD_REQUEST,
        errorMessage,
        null,
        { validationErrors: validationErrors }
      );
    }
    next();
  };
};

module.exports = { validate };
