const errorResponse = (res, status, message) => {
  return res.status(status).json({ status, message });
};
const successResponse = (res, status, data, message) => {
  return res.status(status).json({ status, message, data });
};

module.exports = { errorResponse, successResponse };
