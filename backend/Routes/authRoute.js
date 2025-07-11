const express = require("express");
const router = express.Router();
const { handleVerifyUserClick, verifyEmailToken } = require("../controllers/authController");
router.post("/register", handleVerifyUserClick);
router.get("/verify-email", verifyEmailToken);


module.exports = router;