const { Router } = require("express");
const { checkLogin } = require("../middleware");
const blogRoutes = require("./blogRoute");
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

  handleComment,
} = require("../controllers/handlers");
const upload = require("../multer");

const route = Router();

route.route("/login").get(handleRenderLogin).post(handleLogin);
route
  .route("/signup")
  .get(handleRenderLogin)
  .post(upload.single("image"), handleSignup);

//password routes
route.route("/forgot-password").get(handleforget).post(handleForgetPassword);
route.post("/verify-otp", handleVerificationOfOtp);
route.post("/create-new-password", handlePasswordChange);

route.use(checkLogin);
route.get("/home", handleRenderHome);

route.get("/logout", handleLogout);

route.use("/blog", blogRoutes);

route.post("/submit-comment/:id", handleComment);

module.exports = route;
