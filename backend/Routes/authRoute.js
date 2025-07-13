const express = require("express");
const router = express.Router();
const { handleVerifyUserClick, verifyEmailToken, loginUser } = require("../controllers/authController");
router.post("/register", handleVerifyUserClick);
router.get("/verify-email", verifyEmailToken);
router.get("/login-user",loginUser)
module.exports = router;