const express = require('express');
const { summary,salesData,dispatchData,financialSummary,getMonthlySalesAndDelivered } = require('../controllers/dashboard');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const { isSuper } = require('../middlewares/isSuper');
const router = express.Router();


router.get('/sales', isAuthenticated, isSuper,salesData);
router.get('/dispatch', isAuthenticated, isSuper,dispatchData);
router.get('/finance', isAuthenticated, isSuper,financialSummary);
router.get('/sales-delivered', isAuthenticated, isSuper,getMonthlySalesAndDelivered);
router.post('/', isAuthenticated, isSuper, summary);

module.exports = router;