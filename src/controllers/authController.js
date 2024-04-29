const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserToken = require("../models/UserToken");
const { generateToken } = require("../utils/jwtUtils");

const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(201).json({ user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken({ id: user.id });

    const userToken = new UserToken({
      userId: user._id,
      token,
    });

    await userToken.save();

    res.status(200).json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

const logout = async (req, res) => {
  const token = req.header("Authorization");

  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    await UserToken.findOneAndDelete({ token });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  register,
  login,
  logout,
};
