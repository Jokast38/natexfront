const { PrismaClient, Prisma } = require('@prisma/client');
const { hashPassword } = require('../utils/password');

const prisma = new PrismaClient();

const createUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email: email.toLowerCase(),
                password: await hashPassword(password)
            }
        });

        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
    } catch (e) {
        console.error(e);
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            return res.status(409).json({
                error: e.meta?.target == 'email' ? 'Email déjà utilisé' : 'Conflit sur un autre champ'
            });
        }
        res.status(500).json({ error: 'Erreur lors de la création de l’utilisateur' });
    }
};

const editUser = async (req, res) => {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.password) {
        data.password = await hashPassword(data.password);
    } else if (data.email) {
        data.email = data.email.toLowerCase();
    }

    try {
        const user = await prisma.user.update({
            where: { id },  // id est un string MongoDB
            data
        });

        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
    } catch (e) {
        console.error(e);
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            return res.status(409).json({
                error: e.meta?.target == 'email' ? 'Email déjà utilisé' : 'Conflit sur un autre champ'
            });
        }
        res.status(500).json({ error: 'Erreur lors de la modification de l’utilisateur' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.delete({
            where: { id },
        });

        res.status(200).json(user);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
    }
};

module.exports = {
    createUser,
    editUser,
    deleteUser
};
