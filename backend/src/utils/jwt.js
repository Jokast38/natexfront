const jwt = require('jsonwebtoken');

/**
 * Génère un token JWT à partir des données d'un utilisateur.
 * @param {Object} data - Les données de l'utilisateur à inclure dans le token.
 * @returns {string} Le token JWT.
 */
async function generateToken(data) {
  return jwt.sign(data, process.env.JWT_SECRET, {expiresIn: "30d"});
}

/**
 * Vérifie un token JWT et retourne les données décodées.
 * @param {string} token - Le token JWT à vérifier.
 * @returns {Object} Les données décodées du token.
 */
async function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken
};
