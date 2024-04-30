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
  const { email, password } = req.body;

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

    // If there is no existing user with the same email, create a new user
    const user = new User({ email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const responseData = {
      user: {
        _id: user._id,
        email: user.email,
      },
    };

    return successResponse(
      res,
      HTTP_STATUS_CODE.CREATED,
      responseData,
      HTTP_RESPONSE_MESSAGE.USER_CREATED
    );
  } catch (error) {
    console.error(error.message);
    return errorResponse(
      res,
      HTTP_STATUS_CODE.SERVER_ERROR,
      HTTP_RESPONSE_MESSAGE.SERVER_ERROR
    );
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return errorResponse(
        res,
        HTTP_STATUS_CODE.BAD_REQUEST,
        HTTP_RESPONSE_MESSAGE.INVALID_CREDENTIALS
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorResponse(
        res,
        HTTP_STATUS_CODE.BAD_REQUEST,
        HTTP_RESPONSE_MESSAGE.INVALID_CREDENTIALS
      );
    }

    let token = null; // Initialize token to null

    // Check if the user already has a token in the UserToken model
    let existingUserToken = await UserToken.findOne({ userId: user._id });

    // If the user already has a token, replace it with a new one
    if (existingUserToken) {
      existingUserToken.token = generateToken({ id: user.id });
      await existingUserToken.save();
      token = existingUserToken.token; // Set token variable here
    } else {
      // If the user doesn't have a token, create a new one
      token = generateToken({ id: user.id });

      const userToken = new UserToken({
        userId: user._id,
        token,
      });

      await userToken.save();
    }

    const responseData = {
      user: {
        _id: user._id,
        email: user.email,
      },
      token: token,
    };

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
      responseData,
      HTTP_RESPONSE_MESSAGE.USER_LOGGED_IN_SUCCESS,
      metadata
    );
  } catch (error) {
    console.error(error.message);
    return errorResponse(
      res,
      HTTP_STATUS_CODE.SERVER_ERROR,
      HTTP_RESPONSE_MESSAGE.SERVER_ERROR
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
    // Check if the token exists in the UserToken model
    const existingToken = await UserToken.findOne({ token });

    // If the token does not exist, return response indicating user is already logged out
    if (!existingToken) {
      return errorResponse(
        res,
        HTTP_STATUS_CODE.BAD_REQUEST,
        HTTP_RESPONSE_MESSAGE.ALREADY_LOGGED_OUT
      );
    }

    // If the token exists, delete it from the UserToken model
    await UserToken.findOneAndDelete({ token });

    const metadata = {
      timestamp: new Date().toISOString(), // Timestamp
      ipAddress: req.ip, // User's IP address
      userAgent: req.headers["user-agent"], // User agent
      route: req.route.path, // Route being called
      baseUrl: req.baseUrl, // Base URL
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
      HTTP_STATUS_CODE.SERVER_ERROR,
      HTTP_RESPONSE_MESSAGE.SERVER_ERROR
    );
  }
};



module.exports = {
  register,
  login,
  logout,
};
