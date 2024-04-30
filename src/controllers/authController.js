const bcrypt = require("bcryptjs");
const User = require("../models/User");
const UserToken = require("../models/UserToken");
const { generateToken } = require("../utils/jwtUtils");
const { errorResponse, successResponse } = require("../utils/responses");
const {
  HTTP_STATUS_CODE,
  HTTP_RESPONSE_MESSAGE,
} = require("../constants/httpConstants");

const register = async (req, res) => {
  const { name, email, password, age, gender, phone } = req.body;

  try {
    // Check if there is already a user with the same email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return errorResponse(
        res,
        HTTP_STATUS_CODE.BAD_REQUEST,
        HTTP_RESPONSE_MESSAGE.USER_EXISTS
      );
    }

    // Create a new user with all required fields
    const user = new User({ name, email, password, age, gender, phone });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    await user.save();

    // Prepare response data
    const responseData = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
      },
    };

    // Return success response
    return successResponse(
      res,
      HTTP_STATUS_CODE.CREATED,
      responseData,
      HTTP_RESPONSE_MESSAGE.USER_CREATED
    );
  } catch (error) {
    console.error(error.message);
    // Return error response
    return errorResponse(
      res,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      HTTP_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR
    );
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    let user = await User.findOne({ email });

    // If user not found, return invalid credentials error
    if (!user) {
      return errorResponse(
        res,
        HTTP_STATUS_CODE.BAD_REQUEST,
        HTTP_RESPONSE_MESSAGE.INVALID_CREDENTIALS
      );
    }

    // Check if the provided password matches the stored password hash
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match, return invalid credentials error
    if (!isMatch) {
      return errorResponse(
        res,
        HTTP_STATUS_CODE.BAD_REQUEST,
        HTTP_RESPONSE_MESSAGE.INVALID_CREDENTIALS
      );
    }

    let token = null;

    // Check if the user already has a token in the UserToken model
    let existingUserToken = await UserToken.findOne({ userId: user._id });

    // If the user already has a token, replace it with a new one
    if (existingUserToken) {
      existingUserToken.token = generateToken({ id: user.id });
      await existingUserToken.save();
      token = existingUserToken.token;
    } else {
      // If the user doesn't have a token, create a new one
      token = generateToken({ id: user.id });

      const userToken = new UserToken({
        userId: user._id,
        token,
      });

      await userToken.save();
    }

    // Prepare response data
    const responseData = {
      user: {
        _id: user._id,
        email: user.email,
      },
      token: token,
    };

    // Prepare metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      route: req.route.path,
      baseUrl: req.baseUrl,
    };

    // Return success response
    return successResponse(
      res,
      HTTP_STATUS_CODE.OK,
      responseData,
      HTTP_RESPONSE_MESSAGE.USER_LOGGED_IN_SUCCESS,
      metadata
    );
  } catch (error) {
    // Log the error for debugging
    console.error("Error in login function:", error);

    // Return a generic server error response
    return errorResponse(
      res,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      HTTP_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR
    );
  }
};

const logout = async (req, res) => {
  const token = req.header("Authorization");

  if (!token) {
    return errorResponse(
      res,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      HTTP_RESPONSE_MESSAGE.ACCESS_DENIED
    );
  }

  try {
    // Check if the token exists in the database
    const existingToken = await UserToken.findOne({ token });

    // If the token doesn't exist, return success response indicating user is already logged out
    if (!existingToken) {
      const metadata = {
        timestamp: new Date().toISOString(),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        route: req.route.path,
        baseUrl: req.baseUrl,
      };

      return successResponse(
        res,
        HTTP_STATUS_CODE.OK,
        HTTP_RESPONSE_MESSAGE.ALREADY_LOGGED_OUT,
        metadata
      );
    }
    // Delete the token from the database
    await UserToken.findOneAndDelete({ token });

    const metadata = {
      timestamp: new Date().toISOString(),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      route: req.route.path,
      baseUrl: req.baseUrl,
    };

    return successResponse(
      res,
      HTTP_STATUS_CODE.OK,
      HTTP_RESPONSE_MESSAGE.LOGGED_OUT_SUCCESS,
      metadata
    );
  } catch (error) {
    return errorResponse(
      res,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      HTTP_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR
    );
  }
};




module.exports = {
  register,
  login,
  logout,
};
