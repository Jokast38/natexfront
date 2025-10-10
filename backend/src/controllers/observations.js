const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createObservation = async (req, res) => {
  try {
    const { lat, lng, locationName, legend, userId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const imageUrl = req.file ? req.file.path : null;

    const observation = await prisma.observation.create({
      data: {
        imageUrl,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        locationName,
        legend,
        userId: parseInt(userId),
      },
    });

    res.status(201).json(observation);
  } catch (error) {
    console.error("❌ Erreur création observation:", error);
    res.status(500).json({ error: "Erreur lors de la création de l'observation" });
  }
};

const getObservations = async (req, res) => {
  try {
    const observations = await prisma.observation.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(observations);
  } catch (error) {
    console.error("❌ Erreur récupération observations:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des observations" });
  }
};

const getObservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const observation = await prisma.observation.findUnique({
      where: { id: parseInt(id) },
      include: { user: true },
    });

    if (!observation) {
      return res.status(404).json({ error: "Observation non trouvée" });
    }

    res.status(200).json(observation);
  } catch (error) {
    console.error("❌ Erreur récupération observation:", error);
    res.status(500).json({ error: "Erreur lors de la récupération de l'observation" });
  }
};

const updateObservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, locationName, legend } = req.body;
    const imageUrl = req.file ? req.file.path : undefined;

    const observation = await prisma.observation.update({
      where: { id: parseInt(id) },
      data: {
        ...(imageUrl && { imageUrl }),
        ...(lat && { lat: parseFloat(lat) }),
        ...(lng && { lng: parseFloat(lng) }),
        ...(locationName && { locationName }),
        ...(legend && { legend }),
      },
    });

    res.status(200).json(observation);
  } catch (error) {
    console.error("❌ Erreur mise à jour observation:", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'observation" });
  }
};

const deleteObservation = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.observation.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Observation supprimée avec succès" });
  } catch (error) {
    console.error("❌ Erreur suppression observation:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de l'observation" });
  }
};

module.exports = {
  createObservation,
  getObservations,
  getObservationById,
  updateObservation,
  deleteObservation,
};