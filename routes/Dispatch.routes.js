
const { Router } = require("express");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { CreateDispatch, DeleteDispatch } = require("../controllers/dispatch.controller");

const routes = Router();

routes.route("/createDispatch").post(isAuthenticated, CreateDispatch);
routes.route("/Delete-Dispatch/:id").post(isAuthenticated, DeleteDispatch);
routes.route("/update-Dispatch/:id").put(isAuthenticated, UpdateDispatch);



module.exports = routes;

