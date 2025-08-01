const express = require("express");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const {
  create,
  all,
  details,
  update,
  remove,
  allSuppliers, 
} = require("../controllers/purchaseOrder");
const router = express.Router();

router.post("/", isAuthenticated, create);
router.get("/all", isAuthenticated, all);


router.get("/suppliers", isAuthenticated, allSuppliers);

router.route("/:_id")
  .get(isAuthenticated, details)
  .put(isAuthenticated, update)
  .delete(isAuthenticated, remove);

module.exports = router;
