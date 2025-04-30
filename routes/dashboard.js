const express = require('express');
const { summary } = require('../controllers/dashboard');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const { isSuper } = require('../middlewares/isSuper');
const router = express.Router();

router.post('/', isAuthenticated, isSuper, summary);

module.exports = router;