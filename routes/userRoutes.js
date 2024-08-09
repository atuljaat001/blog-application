const { Router } = require("express");
const { checkLogin } = require("../middleware");
const blogRoutes = require("./blogRoute");
const adminRouter = require("./adminRoute");
const {
  handleRenderLogin,
  handleSignup,
  handleRenderPersonalBlogs,
  handleLogin,
  handleForgetPassword,
  handleforget,
  handleVerificationOfOtp,
  handlePasswordChange,
  handleLogout,
  handleRenderAccount,
  handleEditAccountDetails,
  handleComment,
  handlePostAccountDetails,
  handleRenderChangePassword,
  handleChangePassword,
  handleRenderAllBlogs,
} = require("../controllers/handlers");
const upload = require("../multer");

const route = Router();

route.route("/login").get(handleRenderLogin).post(handleLogin);
route
  .route("/signup")
  .get(handleRenderLogin)
  .post(upload.single("image"), handleSignup);

//password routes
route
  .route("/forgot-password")
  .get(handleforget)
  .post(upload.single("image"), handleForgetPassword);
route.post("/verify-otp", handleVerificationOfOtp);
route.post("/create-new-password", handlePasswordChange);
route.use("/admin", adminRouter);
route.use(checkLogin);
route.get("/home", handleRenderAllBlogs);

route.get("/logout", handleLogout);

route.use("/blog", blogRoutes);

route.get("/account-info", handleRenderAccount);
route
  .route("/edit-profile")
  .get(handleEditAccountDetails)
  .post(upload.single("image"), handlePostAccountDetails);

route.post("/submit-comment/:id", handleComment);
route
  .route("/change-password")
  .get(handleRenderChangePassword)
  .post(handleChangePassword);

route.get("/personal-blog", handleRenderPersonalBlogs);

module.exports = route;
