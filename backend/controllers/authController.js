const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const TempUser = require("../model/TempUser.js");
const User = require("../model/User.js");
const sendEmail = require("../utils/sendEmail.js");

const handleVerifyUserClick = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const token = crypto.randomBytes(32).toString("hex");
  const hashedPassword = await bcrypt.hash(password, 10);

  await TempUser.create({
    name,
    email,
    password: hashedPassword,
    token:token,
    tokenExpires: Date.now() + 15 * 60 * 1000
  });

  const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your email",
    text: `Click the following link to verify your email: ${verificationLink}`
  });

  res.status(200).json({ message: "Verification email sent" });
};

const verifyEmailToken = async (req, res) => {
  const { token } = req.query;
  const tempUser = await TempUser.findOne({ token });
  console.log("tempuser",tempUser);
  if (!tempUser || tempUser.tokenExpires < Date.now()) {
    return res.status(400).json({ message: "Token expired or invalid" });
  }

  await User.create({
    name: tempUser?.name,
    email: tempUser?.email,
    password: tempUser?.password
  });

  await TempUser.deleteOne({ _id: tempUser._id });
  res.status(201).send("Email verified! Account created.");
};

// Exporting functions using CommonJS
module.exports = {
  handleVerifyUserClick,
  verifyEmailToken
};
