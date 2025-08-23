const { Router } = require("express");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const {
  CreateDispatch,
  DeleteDispatch,
  GetDispatch,
  UpdateDispatch,
  sendToDispatch,
  SendFromProduction,
  GetAllDispatches,
} = require("../controllers/dispatch.controller");

const routes = Router();
routes.route("/send-from-production").post(isAuthenticated, SendFromProduction);

routes.route("/create").post(isAuthenticated, CreateDispatch);
// routes.route("/createDispatch").post(isAuthenticated, CreateDispatch);
routes.route("/getAll").get(isAuthenticated, GetAllDispatches);
routes.route("/Delete-Dispatch/:id").post(isAuthenticated, DeleteDispatch);
routes.route("/get-Dispatch").get(isAuthenticated, GetDispatch);

routes.route("/update/:id").put(isAuthenticated, UpdateDispatch);

module.exports = routes;
