
const mongoose = require("mongoose");

const tempUserSchema = mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  token: String,
  tokenExpires: Date
});

module.exports = mongoose.model("TempUser", tempUserSchema);

