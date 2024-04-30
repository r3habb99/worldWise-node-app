const generateRequestId = require("./generateRequestUUids");

const errorResponse = (
  res,
  status,
  message,
  errorCode = null,
  metadata = {}
) => {
  const timestamp = new Date().toISOString();
  const requestId = generateRequestId();

  const response = {
    status,
    message,
    errorCode,
    timestamp,
    requestId,
    ...metadata,
  };

  return res.status(status).json(response);
};

const successResponse = (res, status, data, message, metadata = {}) => {
  const timestamp = new Date().toISOString();
  const requestId = generateRequestId();

  const response = {
    status,
    message,
    data,
    timestamp,
    requestId,
    ...metadata,
  };

  return res.status(status).json(response);
};

module.exports = { errorResponse, successResponse };
