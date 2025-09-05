const express = require('express');
const { summary,salesData,dispatchData,financialSummary, dashboardWithFilter, getMonthlySalesAndDelivered,machineStatus,getAllMachines,getMachineData, getWelcomeMessage } = require('../controllers/dashboard');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const { isSuper } = require('../middlewares/isSuper');
const { getStats } = require('../controllers/stats');
const router = express.Router();


router.get('/sales', isAuthenticated, isSuper,salesData);
router.get('/dispatch', isAuthenticated, isSuper,dispatchData);
router.get('/finance', isAuthenticated, isSuper,financialSummary);
router.get('/sales-delivered', isAuthenticated, isSuper,getMonthlySalesAndDelivered);
router.get("/stats", isAuthenticated, getStats);
router.get('/get-data-from-machine',machineStatus);
// router.get('/get-machine-list',getAllMachines) // Commented out as function is disabled

// Unified API for machine data analysis
router.get('/machine-data', getMachineData);

// Debug endpoint to check database content
// router.get('/debug-machine-data', debugMachineData);

router.get('/', isAuthenticated, isSuper, dashboardWithFilter);
router.get('/welcome', isAuthenticated, getWelcomeMessage);



router.post('/', isAuthenticated, isSuper, summary);

module.exports = router;    



