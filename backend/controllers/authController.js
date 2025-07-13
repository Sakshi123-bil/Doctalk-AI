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

  // Check if a TempUser already exists for this email
  const existingTemp = await TempUser.findOne({ email });

  if (existingTemp) {
    // Update the token and expiry time
    existingTemp.name = name;
    existingTemp.password = hashedPassword;
    existingTemp.token = token;
    existingTemp.tokenExpires = Date.now() + 15 * 60 * 1000;
    await existingTemp.save();
  } else {
    // Create new TempUser
    await TempUser.create({
      name,
      email,
      password: hashedPassword,
      token,
      tokenExpires: Date.now() + 15 * 60 * 1000,
    });
  }

  const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your email",
    text: `Click the following link to verify your email: ${verificationLink}`,
  });

  res.status(200).json({ message: "Verification email sent" });
};


const verifyEmailToken = async (req, res) => {
  const { token } = req.query;
  const tempUser = await TempUser.findOne({ token });
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


const loginUser = async (req, res, next) => {
  try {
    const user = req.body;

    const isUserExist = await User.findOne({ email: user.email });

    if (!isUserExist) {
      return res.status(400).json({ message: "Wrong email or password" });
    }

    const isUserPasswordMatched = await bcrypt.compare(user.password, isUserExist.password);

    if (isUserPasswordMatched) {
      return res.status(200).json({ message: "Logged in successfully" });
    } else {
      return res.status(401).json({ message: "Password is not correct" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Exporting functions using CommonJS
module.exports = {
  handleVerifyUserClick,
  verifyEmailToken,
  loginUser
};
