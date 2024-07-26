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
  handleLogout,
  handleRenderBlog,
  handleBlogPost,
} = require("../controllers/handlers");
const upload = require("../multer");
const route = Router();

route.route("/login").get(handleRenderLogin).post(handleLogin);
route
  .route("/signup")
  .get(handleRenderLogin)
  .post(upload.single("image"), handleSignup);
route.route("/forgot-password").get(handleforget).post(handleForgetPassword);
route.post("/verify-otp", handleVerificationOfOtp);
route.post("/create-new-password", handlePasswordChange);
route.use(checkLogin);
route.get("/home", handleRenderHome);

route.get("/logout", handleLogout);

route.route("/blog").get(handleRenderBlog).post(handleBlogPost);
module.exports = route;
