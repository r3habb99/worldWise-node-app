const HTTP_STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  SERVER_ERROR: 500,
};

const HTTP_RESPONSE_MESSAGE = {
  USER_EXISTS: "User already exists",
  USER_CREATED: "User created successfully",
  INVALID_CREDENTIALS: "Invalid credentials",
  ACCESS_DENIED: "Access denied",
  SERVER_ERROR: "Server Error",
  LOGGED_OUT_SUCCESS: "Logged out successfully",
  USER_LOGGED_IN_SUCCESS: "User logged in success",
  ALREADY_LOGGED_OUT: "User already logout",
};

module.exports = {
  HTTP_STATUS_CODE,
  HTTP_RESPONSE_MESSAGE,
};
