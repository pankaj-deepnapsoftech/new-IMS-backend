const {Router} = require("express");
const { CreateParties, GetParties } = require("../controllers/Parties");
const { Validater } = require("../validation/Validator");
const { PartiesValidation } = require("../validation/parties.validation");
const { isAuthenticated } = require("../middlewares/isAuthenticated");

const routes  = Router();


routes.route("/create").post(isAuthenticated,Validater(PartiesValidation),CreateParties)
routes.route("/create").post(isAuthenticated,GetParties)


module.exports = routes