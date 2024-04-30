const jwt = require("jsonwebtoken");
const { HTTP_STATUS_CODE } = require("../constants/httpConstants");

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return errorResponse(
      res,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      "Access denied. No token provided."
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(
        res,
        HTTP_STATUS_CODE.UNAUTHORIZED,
        "Token expired."
      );
    }
    return errorResponse(res, HTTP_STATUS_CODE.UNAUTHORIZED, "Invalid token.");
  }
};

module.exports = { verifyToken };
