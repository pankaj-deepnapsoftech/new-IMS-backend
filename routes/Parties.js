const {Router} = require("express");
const { CreateParties, GetParties, UpdateParties, DeleteParties } = require("../controllers/Parties");
const { Validater } = require("../validation/Validator");
const { PartiesValidation } = require("../validation/parties.validation");
const { isAuthenticated } = require("../middlewares/isAuthenticated");

const routes  = Router();


routes.route("/create").post(isAuthenticated,Validater(PartiesValidation),CreateParties)
routes.route("/get").get(isAuthenticated,GetParties)
routes.route("/delete/:id").delete(isAuthenticated, DeleteParties)
routes.route("/put/:id").put(isAuthenticated,UpdateParties)


module.exports = routes 