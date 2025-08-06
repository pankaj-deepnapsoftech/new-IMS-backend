const express = require("express");
const {
  create,
  update,
  remove,
  details,
  all,
  unapproved,
  bulkUploadHandler,
  bulkUploadHandlerIndirect,
  workInProgressProducts,
  exportToExcel,
  downloadSampleTemplate,
  exportToExcelIndirect,
  downloadSampleTemplateIndirect,
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
router.get("/:id", isAuthenticated, isAllowed, details);

// Bulk operations
router.post("/bulk", isAuthenticated, isAllowed, upload.single('excel'), bulkUploadHandler);
router.post(
  "/bulkindrect",
  isAuthenticated,
  isAllowed,
  upload.single("excel"),
  bulkUploadHandlerIndirect
);

// Export operations - Updated for direct products 

router.get("/export/excel", isAuthenticated, exportToExcel);
router.get("/export/sample", downloadSampleTemplate);

router.get("/exports/inexcel", isAuthenticated, exportToExcelIndirect);
router.get("/exports/insample", downloadSampleTemplateIndirect);

module.exports = router;