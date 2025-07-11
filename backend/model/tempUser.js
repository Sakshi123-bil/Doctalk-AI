
const mongoose = require("mongoose");

const tempUserSchema = mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  verificationToken: String,
  tokenExpires: Date
});

module.exports = mongoose.model("TempUser", tempUserSchema);

