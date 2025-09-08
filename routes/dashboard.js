const express = require('express');
const { summary,salesData,dispatchData,financialSummary, dashboardWithFilter, getMonthlySalesAndDelivered,machineStatus,getAllMachines, getWelcomeMessage } = require('../controllers/dashboard');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const { isSuper } = require('../middlewares/isSuper');
const { getStats } = require('../controllers/stats');
const { getInventoryStats } = require('../controllers/inventory_dashboard_stats');
const router = express.Router();


router.get('/sales', isAuthenticated, isSuper,salesData);
router.get('/dispatch', isAuthenticated, isSuper,dispatchData);
router.get('/finance', isAuthenticated, isSuper,financialSummary);
router.get('/sales-delivered', isAuthenticated, isSuper,getMonthlySalesAndDelivered);
router.get("/stats", isAuthenticated, getStats);
router.get('/get-data-from-machine',machineStatus)
router.get('/get-machine-list',getAllMachines)

router.get('/', isAuthenticated, isSuper, dashboardWithFilter);
router.get('/welcome', isAuthenticated, getWelcomeMessage);

router.get("/inventory-stats", isAuthenticated, getInventoryStats);



router.post('/', isAuthenticated, isSuper, summary);

module.exports = router;    



