const { Router } = require("express");
const { checkLogin } = require("../middleware");
const {
  handleRenderLogin,
  handleSignup,
  handleRenderHome,
  handleLogin,
  handleForgetPassword,
  handleforget,
  handleVerificationOfOtp,
  handlePasswordChange,
} = require("../controllers/handlers");
const route = Router();

route.route("/login").get(handleRenderLogin).post(handleLogin);
route.route("/signup").get(handleRenderLogin).post(handleSignup);
route.get("/home", checkLogin, handleRenderHome);
route.route("/forgot-password").get(handleforget).post(handleForgetPassword);
route.post("/verify-otp", handleVerificationOfOtp);
route.post("/create-new-password", handlePasswordChange);
module.exports = route;
