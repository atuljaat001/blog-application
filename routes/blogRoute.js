const express = require("express");
const blogRoute = express.Router();
const {
  handleBlogPost,
  handleRenderBlog,
  handlePersonalBlog,
  handleBlogDelete,
  handleBlogEdit,
  handleDeleteComment,
  handleBlogEditPost,
  handleHomeBlog,
} = require("../controllers/handlers");
const upload2 = require("../multer2");

blogRoute
  .route("/")
  .get(handleRenderBlog)
  .post(upload2.single("coverImage"), handleBlogPost);

blogRoute.get("/edit-blog/:id", handleBlogEdit);
blogRoute.post(
  "/submit-blog/:id",
  upload2.single("coverImage"),
  handleBlogEditPost
);
blogRoute.get("/delete-blog/:id", handleBlogDelete);
blogRoute.get("/delete-comment/:id", handleDeleteComment);
blogRoute.get("/home-blog/:id", handleHomeBlog);
blogRoute.get("/personal-blog/:id", handlePersonalBlog);

module.exports = blogRoute;
