const express = require('express');
const {
    createUser,
    deleteUser,
    editUser,
} = require('../controllers/user');

const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.post('/', createUser);
router.put('/:id', editUser);
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;
