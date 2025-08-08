const express = require("express");
const { 
  create, 
  update, 
  remove, 
  details, 
  all, 
  unapproved, 
  bulkUploadHandler, 
  workInProgressProducts,
  exportToExcel,
  downloadSampleTemplate,
  rawMaterials
} = require("../controllers/product");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { isSuper } = require("../middlewares/isSuper");
const { isAllowed } = require("../middlewares/isAllowed");
const { upload } = require("../utils/upload");
const router = express.Router();

// CRUD operations
router.route("/")
  .post(isAuthenticated, isAllowed, create)
  .put(isAuthenticated, isAllowed, update)
  .delete(isAuthenticated, isAllowed, remove);

// Get operations
router.get("/all", isAuthenticated, all);
router.get("/wip", isAuthenticated, workInProgressProducts);
router.get("/unapproved", isAuthenticated, isSuper, unapproved);
router.get("/raw-materials", isAuthenticated, rawMaterials);
router.get("/:id", isAuthenticated, isAllowed, details);

// Bulk operations
router.post("/bulk", isAuthenticated, isAllowed, upload.single('excel'), bulkUploadHandler);

// Export operations - Updated for direct products 

router.get("/export/excel", isAuthenticated, exportToExcel);
router.get("/export/sample", downloadSampleTemplate);

module.exports = router;