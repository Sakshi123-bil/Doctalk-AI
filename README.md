// 📁 server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api", authRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => app.listen(5000, () => console.log("Server running on port 5000")))
.catch((err) => console.error(err));


// 📁 models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);


// 📁 models/TempUser.js
import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  token: String,
  tokenExpires: Date
});

export default mongoose.model("TempUser", tempUserSchema);


// 📁 routes/authRoutes.js
import express from "express";
import { handleVerifyUserClick, verifyEmailToken } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", handleVerifyUserClick);
router.get("/verify-email", verifyEmailToken);

export default router;


// 📁 controllers/authController.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import TempUser from "../models/TempUser.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

export const handleVerifyUserClick = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const token = crypto.randomBytes(32).toString("hex");
  const hashedPassword = await bcrypt.hash(password, 10);

  await TempUser.create({
    name,
    email,
    password: hashedPassword,
    token,
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

export const verifyEmailToken = async (req, res) => {
  const { token } = req.query;

  const tempUser = await TempUser.findOne({ token });
  if (!tempUser || tempUser.tokenExpires < Date.now()) {
    return res.status(400).json({ message: "Token expired or invalid" });
  }

  await User.create({
    name: tempUser.name,
    email: tempUser.email,
    password: tempUser.password
  });

  await TempUser.deleteOne({ _id: tempUser._id });
  res.status(201).send("Email verified! Account created.");
};


// 📁 utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });
};

export default sendEmail;


// 📁 .env (create this file at root)
MONGO_URI=mongodb://localhost:27017/emailverifydb
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=yourgmailpassword
