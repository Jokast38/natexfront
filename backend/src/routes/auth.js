const express = require("express");
const { auth, verifyJwt } = require("../controllers/auth");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.post("/", auth);
router.get("/verifyJwt", authMiddleware, verifyJwt);

module.exports = router;
