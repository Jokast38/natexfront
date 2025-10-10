const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { authMiddleware } = require("../middlewares/auth");
const {
  createObservation,
  getObservations,
  getObservationById,
  updateObservation,
  deleteObservation,
} = require("../controllers/observations");

// CRUD protégé par authentification
router.post("/", authMiddleware, upload.single("image"), createObservation);
router.get("/", getObservations);
router.get("/:id", getObservationById);
router.put("/:id", authMiddleware, upload.single("image"), updateObservation);
router.delete("/:id", authMiddleware, deleteObservation);

module.exports = router;