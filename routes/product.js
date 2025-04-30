const express = require("express");
const { create, update, remove, details, all, unapproved, bulkUploadHandler, workInProgressProducts } = require("../controllers/product");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { isSuper } = require("../middlewares/isSuper");
const { isAllowed } = require("../middlewares/isAllowed");
const { upload } = require("../utils/upload");
const router = express.Router();

router.route("/").post(isAuthenticated, isAllowed, create).put(isAuthenticated, isAllowed, update).delete(isAuthenticated, isAllowed, remove);
router.get("/all", isAuthenticated, all);
router.get("/wip", isAuthenticated, workInProgressProducts);
router.get("/unapproved", isAuthenticated, isSuper, unapproved);
router.post("/bulk", isAuthenticated, upload.single('excel'), bulkUploadHandler);
router.get("/:id", isAuthenticated, isAllowed, details);

module.exports = router;
