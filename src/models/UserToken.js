const mongoose = require("mongoose");

const userTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expires_at: {
    type: Date,
  },
});

module.exports = mongoose.model("UserToken", userTokenSchema);
