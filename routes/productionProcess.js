const express = require("express");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const {
  create,
  details,
  update,
  remove,
  all,
  markDone,
  updateStatus,
  requestForAllocation,
  markInventoryInTransit,
  startProduction
} = require("../controllers/process");
const router = express.Router();
router.get("/allocation", isAuthenticated, requestForAllocation);
router.put("/inventory-in-transit", isAuthenticated, markInventoryInTransit); //new
router.put("/start-production", isAuthenticated, startProduction);//new 
router.post("/", isAuthenticated, create);
router.get("/all", isAuthenticated, all);
router.get("/done/:_id", isAuthenticated, markDone);
router.route("/:_id")
  .get(isAuthenticated, details)
  .put(isAuthenticated, update)
  .delete(isAuthenticated, remove);
router.put("/update-status", updateStatus);



module.exports = router;
 