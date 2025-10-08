const {PrismaClient} = require("@prisma/client");
const {checkPassword} = require("../utils/password");
const {generateToken} = require("../utils/jwt");

const prisma = new PrismaClient();

const auth = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {email: email.toLowerCase()},
    });

    if (!user) {
      return res.status(401).json({error: "Email ou mot de passe incorrect"});
    }

    const isPasswordValid = await checkPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({error: "Email ou mot de passe incorrect"});
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    res.status(200).json({token});
  } catch (error) {
    console.error("Erreur d’authentification :", error);
    res.status(500).json({error: "Erreur lors de l'authentification"});
  }
};

const verifyJwt = async (req, res) => {
  res.status(200).json({message: "Token valide"});
};

module.exports = {auth, verifyJwt};
