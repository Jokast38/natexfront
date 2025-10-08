const { hash, compare } = require("bcrypt");

/**
 * Hache un mot de passe en clair.
 * @param myPlaintextPassword - Le mot de passe en clair à hacher.
 * @param saltRounds - Le nombre de tours de salage (par défaut 10).
 * @returns Le hash du mot de passe.
 */
const hashPassword = async (myPlaintextPassword, saltRounds = 10) => {
    return await hash(myPlaintextPassword, saltRounds);
}

/**
 * Vérifie si un mot de passe en clair correspond à un hash donné.
 * @param myPlaintextPassword - Le mot de passe en clair.
 * @param passwordHash - Le hash du mot de passe à comparer.
 * @returns Un booléen indiquant si le mot de passe correspond.
 */
const checkPassword = async (myPlaintextPassword, passwordHash) => {
    return await compare(myPlaintextPassword, passwordHash);
}

module.exports = {
    hashPassword,
    checkPassword
};
