
const { Router } = require("express");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { CreateDispatch, DeleteDispatch, GetDispatch, UpdateDispatch } = require("../controllers/dispatch.controller");

const routes = Router();

routes.route("/createDispatch").post(isAuthenticated, CreateDispatch);
routes.route("/Delete-Dispatch/:id").post(isAuthenticated, DeleteDispatch);
routes.route("/get-Dispatch").get(isAuthenticated, GetDispatch);
routes.route("/update-Dispatch/:id").put(isAuthenticated, UpdateDispatch);



module.exports = routes;

