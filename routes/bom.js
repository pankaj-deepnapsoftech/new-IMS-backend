//bom routes
const express = require('express');
const { create, unapproved, update,approved, remove, details, all, autoBom,findFinishedGoodBom, unapprovedRawMaterials, approveRawMaterial, approveRawMaterialForAdmin, unapprovedRawMaterialsForAdmin, bomsGroupedByWeekDay, bulkUploadBOMHandler, allRawMaterialsForInventory, getInventoryShortages, getInventoryApprovalStatus, getSalesOrderStatus, getAllBOMs } = require('../controllers/bom');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const { isAllowed } = require('../middlewares/isAllowed');
const { isSuper } = require('../middlewares/isSuper');
const { Validater } = require("../validation/Validator");
const { BOMValidation } = require("../validation/bom.validation");
const router = express.Router();

router.post("/", isAuthenticated, isAllowed, Validater(BOMValidation), create);
router.get("/all", all);
router.get("/unapproved", isAuthenticated, isSuper, unapproved);
// router.get('/approved', isAuthenticated, isSuper, approved);
router.get("/autobom", isAuthenticated, isSuper, autoBom);
router.get(
  "/unapproved/raw-materials",
  isAuthenticated,
  isSuper,
  unapprovedRawMaterialsForAdmin
);
router.post(
  "/approve/raw-materials",
  isAuthenticated,
  isSuper,
  approveRawMaterialForAdmin
);
router.get(
  "/unapproved/inventory/raw-materials",
  isAuthenticated,
  unapprovedRawMaterials
);
router.get(
  "/all/inventory/raw-materials",
  isAuthenticated,
  allRawMaterialsForInventory
);
router.post(
  "/approve/inventory/raw-materials",
  isAuthenticated,
  approveRawMaterial
);
router.get("/weekly", isAuthenticated, bomsGroupedByWeekDay);
router.get("/inventory-shortages", isAuthenticated, getInventoryShortages);
router.get("/inventory-approval-status/:salesOrderId", isAuthenticated, getInventoryApprovalStatus);
router.get("/sales-order-status/:salesOrderId", isAuthenticated, getSalesOrderStatus);
router.get("/all-boms", isAuthenticated, getAllBOMs);
router.get("/bom/:_id", isAuthenticated, findFinishedGoodBom);
router
  .route("/:id")
  .delete(isAuthenticated, isAllowed, remove)
  .get(isAuthenticated, isAllowed, details)
  .put(isAuthenticated, isAllowed, update);
module.exports = router;
