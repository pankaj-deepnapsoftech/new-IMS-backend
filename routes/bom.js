const express = require('express');
const { create, unapproved, update, remove, details, all, findFinishedGoodBom, unapprovedRawMaterials, approveRawMaterial, approveRawMaterialForAdmin, unapprovedRawMaterialsForAdmin } = require('../controllers/bom');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const { isAllowed } = require('../middlewares/isAllowed');
const { isSuper } = require('../middlewares/isSuper');
const router = express.Router();

router.post('/', isAuthenticated, isAllowed, create);
router.get('/all', all);
router.get('/unapproved', isAuthenticated, isSuper, unapproved);
router.get('/unapproved/raw-materials', isAuthenticated, isSuper, unapprovedRawMaterialsForAdmin);
router.post('/approve/raw-materials', isAuthenticated, isSuper, approveRawMaterialForAdmin);
router.get('/unapproved/inventory/raw-materials', isAuthenticated, unapprovedRawMaterials);
router.post('/approve/inventory/raw-materials', isAuthenticated, approveRawMaterial);
router.route('/:id')
        .put(isAuthenticated, isAllowed, update)
        .delete(isAuthenticated, isAllowed, remove)
        .get(isAuthenticated, isAllowed, details);
router.get('/bom/:_id', isAuthenticated, findFinishedGoodBom);

module.exports = router;