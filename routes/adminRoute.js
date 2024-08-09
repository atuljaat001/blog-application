const express = require("express");
const adminRouter = express.Router();
const {
  handleAdmin,
  handleDeleteUser,
  handleAdminAddUser,
  handleRenderAddUser,
} = require("../controllers/handlers");
const { authorization, checkLogin } = require("../middleware");

// Apply checkLogin middleware to populate req.user
adminRouter.use(checkLogin);

console.log(authorization);

adminRouter.use(authorization(["ADMIN"]));
adminRouter.get("/", handleAdmin);
adminRouter.get("/delete-user/:id", handleDeleteUser);
adminRouter
  .route("/add-user")
  .get(handleRenderAddUser)
  .post(handleAdminAddUser);

module.exports = adminRouter;
