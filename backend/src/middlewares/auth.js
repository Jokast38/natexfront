const {verifyToken} = require('../utils/jwt');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({error: 'Token manquant'});
  }

  try {
    // Vérification du token
    await verifyToken(token);

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({error: 'Token invalide'});
  }
};

module.exports = {authMiddleware};
