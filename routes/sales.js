const express = require("express");
const { create, update, getAll } = require("../controllers/sales");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
// const { isSuper } = require("../middlewares/isSuper");
// const { isAllowed } = require("../middlewares/isAllowed");
const { Imageupload } = require("../utils/upload");

const router = express.Router();

// router.route("/").post(isAuthenticated, isAllowed, create).put(isAuthenticated, isAllowed, update).delete(isAuthenticated, isAllowed, remove);
// router.get("/all", isAuthenticated, all);
// router.get("/wip", isAuthenticated, workInProgressProducts);
// router.get("/unapproved", isAuthenticated, isSuper, unapproved);
router.post("/create", isAuthenticated, create);
// router.get("/:id", isAuthenticated, isAllowed, details);

router.post(
    "/update/:id",
    isAuthenticated,
    update
);

router.get("/getAll", isAuthenticated, getAll);

module.exports = router;
//