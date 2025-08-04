const express = require('express');
const { create, unapproved, update, remove, details, all, findFinishedGoodBom, unapprovedRawMaterials, approveRawMaterial, approveRawMaterialForAdmin, unapprovedRawMaterialsForAdmin, bomsGroupedByWeekDay, bulkUploadBOMHandler } = require('../controllers/bom');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const { isAllowed } = require('../middlewares/isAllowed');
const { isSuper } = require('../middlewares/isSuper');
// const { upload } = require('../utils/upload');
// const multer = require("multer");
const router = express.Router();

router.post('/', isAuthenticated, isAllowed, create);
router.get('/all', all);
router.get('/unapproved', isAuthenticated, isSuper, unapproved);
router.get('/unapproved/raw-materials', isAuthenticated, isSuper, unapprovedRawMaterialsForAdmin);
router.post('/approve/raw-materials', isAuthenticated, isSuper, approveRawMaterialForAdmin);
router.get('/unapproved/inventory/raw-materials', isAuthenticated, unapprovedRawMaterials);
router.post('/approve/inventory/raw-materials', isAuthenticated, approveRawMaterial);
router.get('/weekly', isAuthenticated, bomsGroupedByWeekDay);
router.route('/:id')    
        .delete(isAuthenticated, isAllowed, remove)
        .get(isAuthenticated, isAllowed, details);
router.get('/bom/:_id', isAuthenticated, findFinishedGoodBom);
router.route('/:id')
        .put(isAuthenticated, isAllowed, update)
        // router.post("/bulk", isAuthenticated, upload.single('excel'), bulkUploadBOMHandler);
module.exports = router;