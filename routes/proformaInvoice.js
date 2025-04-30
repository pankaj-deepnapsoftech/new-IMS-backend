const express = require('express');
const { create, all, details, update, remove } = require('../controllers/proformaInvoice');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const router = express.Router();

router.post('/', isAuthenticated, create);
router.get('/all', isAuthenticated, all);
router.route('/:_id')
        .get(isAuthenticated, details)
        .put(isAuthenticated, update)
        .delete(isAuthenticated, remove)

module.exports = router;