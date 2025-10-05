const express = require('express');
const router = express.Router();
const { getUsersByRole, createUser, updateUser, deleteUser } = require('../controllers/userController');

router.get('/:role', getUsersByRole);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;